# Especificação de Segurança - Meu Controle Financeiro

## Invariantes de Dados
1. Cada transação deve obrigatoriamente pertencer a um usuário autenticado.
2. A leitura e escrita só é permitida se o `userId` na rota do Firestore coincidir com o `uid` do usuário autenticado.
3. Transações devem possuir tipos (receita/despesa) e status válidos.

## The "Dirty Dozen" Payloads (Ataques Identificados)
1. **Identidade Estendida:** Tentar ler `/users/atacker_id/transactions/any` estando logado como `user_id`. (Deverá ser BLOQUEADO)
2. **Resource Poisoning:** Enviar uma transação com `description` de 2MB para esgotar recursos. (Deverá ser BLOQUEADO por limites de tamanho)
3. **Identity Spoofing:** Criar uma transação com `id` de outro usuário no meio da rota. (Deverá ser BLOQUEADO)
4. **Atributos Fantasma:** Enviar campo `isVerified: true` em uma transação para tentar ganhar privilégios. (Deverá ser BLOQUEADO por schema estrito)
5. **Data Overwriting:** Alterar a data de uma transação consolidade de meses atrás sem permissão. (Deverá ser BLOQUEADO)
6. **Query Scrapping:** Tentar listar todas as transações do sistema sem filtro de `userId`. (Deverá ser BLOQUEADO pelas regras de lista)
7. **Bypass de Validação:** Enviar `amount` como string ao invés de número. (Deverá ser BLOQUEADO por tipo)
8. **Status Inexistente:** Definir `status: 'waiting_hack'` em um registro. (Deverá ser BLOQUEADO por enum)
9. **Settings Hijacking:** Modificar as configurações de orçamento de outro usuário. (Deverá ser BLOQUEADO)
10. **Ataque de Cross-User:** Tentar atualizar `totalInstallments` de uma recorrência pertencente a outro usuário. (Deverá ser BLOQUEADO)
11. **Spoofing de Email:** Tentar se passar por admin sem email verificado. (Deverá ser BLOQUEADO)
12. **Apagamento em Massa:** Tentar deletar a coleção de transações de outro usuário em lote. (Deverá ser BLOQUEADO)

## Próximos Passos
- Implementar `firestore.rules` com os 8 pilares.
- Validar via testes de segurança.
