type storage_t          is [@layout:comb] record [
  ubinetic_oracle         : address;
  uusd_token              : address;
  random                  : nat;
]

type action_t           is
| Test                    of unit

type return_t           is list(operation) * storage_t
