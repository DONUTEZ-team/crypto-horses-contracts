function get_ubinetic_fulfill_entrypoint(
  const ubinetic        : address)
                        : contract(fulfill_t) is
  unwrap(
    (Tezos.get_entrypoint_opt("%fulfill", ubinetic) : option(contract(fulfill_t))),
    Game.err_ubinetic_fulfill_entrypoint_404
  )

function get_fulfill_op(
  const fulfill_params  : fulfill_t;
  const ubinetic        : address)
                        : operation is
  Tezos.transaction(fulfill_params, 0mutez, get_ubinetic_fulfill_entrypoint(ubinetic))
