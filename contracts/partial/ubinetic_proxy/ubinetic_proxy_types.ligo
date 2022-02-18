type storage_t          is [@layout:comb] record [
  ubinetic                : address;
  admin                   : address;
  pending_admin           : address;
]

type change_ubinetic_t  is address

type action_t           is
| Set_admin               of set_admin_t
| Confirm_admin           of confirm_admin_t
| Change_ubinetic         of change_ubinetic_t

type return_t           is list(operation) * storage_t
