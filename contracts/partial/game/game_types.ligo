type storage_t          is [@layout:comb] record [
  uusd_token              : address;
  ubinetic                : address;
  random                  : nat;
]

type fulfill_t          is [@layout:comb] record [
  script                  : bytes;
  payload                 : bytes;
]

type action_t           is
| Bet                     of fulfill_t
| Default                 of unit

type return_t           is list(operation) * storage_t
