const DEFAULT_BASE_URL = 'https://sandbox.asaas.com/api/v3';

function getBaseUrl() {
    return process.env.ASAAS_API_BASE_URL || DEFAULT_BASE_URL;
}

function getApiKey() {
    const key = process.env.ASAAS_API_KEY;
    if (!key) {
        throw new Error('ASAAS_API_KEY não configurado nas variáveis de ambiente do servidor.');
    }
    return key;
}

async function asaasFetch(path: string, init: RequestInit = {}) {
    const res = await fetch(`${getBaseUrl()}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            access_token: getApiKey(),
            ...(init.headers || {}),
        },
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
        throw new Error(`Asaas API ${path} respondeu ${res.status}: ${JSON.stringify(data)}`);
    }
    return data;
}

export interface AsaasCustomer {
    id: string;
    name: string;
    email: string;
    externalReference?: string;
}

export async function findCustomerByExternalReference(uid: string): Promise<AsaasCustomer | null> {
    const data = await asaasFetch(`/customers?externalReference=${encodeURIComponent(uid)}`);
    return data?.data?.[0] ?? null;
}

export async function createCustomer(params: { name: string; email: string; cpfCnpj: string; uid: string }): Promise<AsaasCustomer> {
    return asaasFetch('/customers', {
        method: 'POST',
        body: JSON.stringify({
            name: params.name,
            email: params.email,
            cpfCnpj: params.cpfCnpj.replace(/\D/g, ''),
            externalReference: params.uid,
        }),
    });
}

export interface AsaasPayment {
    id: string;
    status: string;
    value: number;
}

export interface AsaasPixQrCode {
    encodedImage: string;
    payload: string;
    expirationDate: string;
}

export async function createPixCharge(params: {
    customerId: string;
    uid: string;
    value: number;
    description: string;
}): Promise<{ payment: AsaasPayment; qrCode: AsaasPixQrCode }> {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);

    const payment: AsaasPayment = await asaasFetch('/payments', {
        method: 'POST',
        body: JSON.stringify({
            customer: params.customerId,
            billingType: 'PIX',
            value: params.value,
            dueDate: dueDate.toISOString().slice(0, 10),
            description: params.description,
            externalReference: params.uid,
        }),
    });

    const qrCode: AsaasPixQrCode = await asaasFetch(`/payments/${payment.id}/pixQrCode`);

    return { payment, qrCode };
}
