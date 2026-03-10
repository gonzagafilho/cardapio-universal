# Cardápio Nexora — O que existe e o que falta

Para **restaurantes (pequenos), hamburgerias, depósitos de bebidas** e similares.

---

## O que já existe no sistema

| Recurso | Uso em restaurante / hamburgueria / depósito |
|--------|------------------------------------------------|
| **Establishment** | Nome, slug, descrição, logo, banner, endereço, telefone, WhatsApp, email. |
| **Category** | Categorias (Pizzas, Bebidas, Combos, etc.) com ordem e descrição. |
| **Product** | Nome, slug, descrição, imagem, preço, preço riscado (compareAtPrice), SKU, destaque. |
| **OptionalGroup / OptionalItem** | Tamanhos (P/M/G), extras (bacon, queijo), ponto da carne, acompanhamento, **volume** (350ml / 2L) — cada um com preço. |
| **StoreSettings** | Pedido mínimo, taxa de entrega (global), tempo estimado, aceita delivery / retirada / consumo no local, moeda. |
| **WorkingHours** | Horário por dia da semana (abre/fecha, dia fechado). |
| **Banner** | Banners promocionais com imagem, link, período (início/fim). |
| **Coupon** | Cupom de desconto (%, valor fixo), valor mínimo, limite de uso. |
| **DeliveryZone** | Zonas de entrega com taxa e tempo (min/max) por zona. |
| **Order / OrderItem** | Pedido com itens, quantidade, preço; **observação do pedido** (Order.notes) e **observação do item** (OrderItem.notes). |
| **OrderItemOption** | Snapshot dos opcionais escolhidos (nome do grupo, nome do item, preço). |
| **Customer / CustomerAddress** | Cliente e endereços de entrega. |
| **Table** | Mesa/comanda (estrutura existe no banco). |
| **Payment** | Pagamento (PIX, cartão, dinheiro, etc.) vinculado ao pedido. |

Com isso já dá para montar cardápio completo para **restaurante**, **hamburgueria** e **depósito** (bebidas por volume via opcionais ou produtos separados).

---

## O que falta ou é desejável (por tipo)

### Para qualquer um (restaurante, hamburgueria, depósito)

| O que falta | Descrição | Prioridade |
|-------------|-----------|------------|
| **Pedido vinculado à mesa** | Hoje existe `Table`, mas **Order** não tem `tableId`. Para “consumo no local” com número da mesa/comanda, não há vínculo no schema. | **Alta** se usar mesa/comanda no local. |
| **Pedido mínimo só para delivery** | StoreSettings tem um único `minimumOrderAmount`. Alguns negócios querem mínimo só para entrega (ex.: R$ 30 delivery, retirada sem mínimo). | Média. |
| **Produto “esgotado agora”** | Só existe `isActive` no Product. Para “esgotado hoje” sem tirar do cardápio seria útil algo como `isAvailable` ou controle por horário. | Média. |

### Restaurante (pequeno)

- **Já cobre:** cardápio (categorias, pratos, opcionais), pedido mínimo, horário, delivery/retirada/mesa, cupom, banners.
- **Falta útil:** vínculo **Order → Table** para pedido na mesa; opcionalmente pedido mínimo diferente para delivery.

### Hamburgueria

- **Já cobre:** hambúrgueres, opcionais (bacon, queijo, tamanho P/M/G via OptionalGroup), combos como “produto” (ex.: Combo X com preço fixo), delivery/retirada.
- **Falta útil:** mesmo que restaurante (mesa no pedido, mínimo só delivery); combos **configuráveis** (escolher 1 burger + 1 bebida) exigiria outro modelo (ProductKit ou similar), hoje não existe.

### Depósito de bebidas

- **Já cobre:** produtos por nome (cerveja, refri, etc.), “tamanho” ou “volume” via opcionais (ex.: 350ml, 473ml, 2L com preços) ou produtos separados (Coca 2L, Coca Lata). Pedido mínimo, zonas de entrega, horário.
- **Falta útil:** campo **unidade de venda** no produto (unidade, caixa, etc.) é só “nice to have”; dá para colocar no nome (ex.: “Cerveja Heineken – Caixa 12x350ml”). **Order.tableId** se vender no balcão com comanda.

---

## Resumo “urgente” (o que falta de fato)

1. **Order.tableId (opcional)**  
   - Permite vincular pedido à mesa/comanda (DINE_IN).  
   - Table já existe; falta só a FK no Order.

2. **Pedido mínimo só para delivery (opcional)**  
   - Ex.: `minimumOrderAmountDelivery` em StoreSettings; retirada/consumo no local sem mínimo ou com outro valor.

3. **Produto “indisponível” sem tirar do cardápio (opcional)**  
   - Ex.: `Product.isAvailable` (boolean) ou equivalente para “esgotado agora” mantendo item visível.

O resto (tamanhos, volumes, extras, combos como produto único, cupom, zonas, horários) **já está coberto** pelo schema atual.  
Para **combos configuráveis** (montar combo escolhendo itens), aí sim seria preciso evoluir o modelo (ex.: entidade de Kit/Combo com itens vinculados).

---

## Arquivos de referência

- **Schema:** `prisma/schema.prisma` (Establishment, Product, Category, OptionalGroup, StoreSettings, Order, Table, DeliveryZone, etc.)
- **Demo comercial:** `prisma/seed-demo-comercial.ts` (exemplo de categorias, produtos, opcionais, combos como produto).
