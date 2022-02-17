function only_admin(
  const admin           : address)
                        : unit is
  block {
    assert_with_error(Tezos.sender = admin, Common.err_not_admin);
  } with unit

function only_pending_admin(
  const pending_admin   : address)
                        : unit is
  block {
    assert_with_error(Tezos.sender = pending_admin, Common.err_not_pending_admin);
  } with unit

function unwrap_or(
  const param           : option(_a);
  const default         : _a)
                        : _a is
  case param of
  | Some(instance) -> instance
  | None           -> default
  end

function unwrap(
  const param           : option(_a);
  const error           : string)
                        : _a is
  case param of
  | Some(instance) -> instance
  | None           -> (failwith(error) : _a)
  end
