function set_admin(
  const admin           : set_admin_t;
  var s                 : storage_t)
                        : return_t is
  block {
    only_admin(s.admin);

    s.pending_admin := admin;
  } with ((nil : list(operation)), s)

function confirm_admin(
  var s                 : storage_t)
                        : return_t is
  block {
    only_pending_admin(s.pending_admin);

    s.admin := s.pending_admin;
    s.pending_admin := Constants.zero_address;
  } with ((nil : list(operation)), s)

function change_randomizer(
  const randomizer      : change_randomizer_t;
  var s                 : storage_t)
                        : return_t is
  block {
    only_admin(s.admin);

    s.randomizer := randomizer;
  } with ((nil : list(operation)), s)
