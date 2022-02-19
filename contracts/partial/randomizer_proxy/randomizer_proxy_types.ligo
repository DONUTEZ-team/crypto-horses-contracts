type storage_t          is [@layout:comb] record [
  randomizer              : address;
  admin                   : address;
  pending_admin           : address;
]

type change_randomizer_t  is address

type get_random_t       is [@layout:comb] record [
  _from                    : nat;
  _to                      : nat;
  entropy                  : bytes;
  includeRandomizerEntropy : bool;
]

type action_t           is
| Set_admin               of set_admin_t
| Confirm_admin           of confirm_admin_t
| Change_randomizer       of change_randomizer_t

type return_t           is list(operation) * storage_t
