type set_admin_t        is address

type confirm_admin_t    is unit

type tez_t              is unit

type fa12_token_t       is address

type fa2_token_t        is [@layout:comb] record [
  token                   : address;
  id                      : nat;
]

type token_t            is
| Tez                     of tez_t
| Fa12                    of fa12_token_t
| Fa2                     of fa2_token_t

type account_t          is [@layout:comb] record [
  allowances              : set(address);
]

type token_info_t       is [@layput:comb] record [
  name                    : string;
  lvl                     : nat;
  speed                   : nat;
  stamina                 : nat;
  age                     : timestamp;
  race_counter            : nat;
  last_race               : timestamp;
  in_race                 : bool;
]
