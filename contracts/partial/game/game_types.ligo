type storage_t          is [@layout:comb] record [
  uusd_token              : address;
  randomizer              : address;
  ubinetic                : address;
  entropy                 : bytes;
  current_epoch           : nat;
  random                  : nat;
]

type bet_t              is unit

type default_t          is unit

type get_random_t       is [@layout:comb] record [
  _from                    : nat;
  _to                      : nat;
  entropy                  : bytes;
  includeRandomizerEntropy : bool;
]

type action_t           is
| Bet                     of bet_t
| Default                 of default_t

type return_t           is list(operation) * storage_t
