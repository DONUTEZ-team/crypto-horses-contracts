[@view] function get_current_epoch(
  const _               : unit;
  const s               : storage_t)
                        : nat is
  unwrap(
    (Tezos.call_view("get_current_epoch", Unit, s.ubinetic) : option(nat)),
    UbineticProxy.err_ubinetic_get_current_epoch_view_404
  )

[@view] function get_entropy(
  const epoch           : nat;
  const s               : storage_t)
                        : bytes is
  unwrap(
    (Tezos.call_view("get_entropy", epoch, s.ubinetic) : option(bytes)),
    UbineticProxy.err_ubinetic_get_entropy_view_404
  )
