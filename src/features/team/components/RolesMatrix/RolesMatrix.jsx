import RoleHeaderCell from '../RoleHeaderCell/RoleHeaderCell';
import PermissionCell from '../PermissionCell/PermissionCell';
import './RolesMatrix.css';

export default function RolesMatrix({
  roles = [],
  permissions = [],
  canEdit = false,
  onCellChange,
  isLoading = false,
}) {
  if (isLoading) {
    return (
      <section className="roles-matrix-card" aria-label="Loading permissions matrix">
        <div className="roles-matrix-table-wrapper" aria-hidden="true">
          <table className="roles-matrix-table">
            <thead>
              <tr>
                <th scope="col" className="roles-col-perm">Permission</th>
                <th scope="col" className="roles-col-role">Admin</th>
                <th scope="col" className="roles-col-role">Support Agent</th>
                <th scope="col" className="roles-col-role">Customer</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(13)].map((_, i) => (
                <tr key={i} className="roles-tr--skeleton">
                  <td colSpan={4}>
                    <div className="roles-skeleton-row" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  return (
    <section className="roles-matrix-card" aria-label="Roles and permissions matrix">
      <div
        className="roles-matrix-table-wrapper"
        tabIndex={0}
        role="region"
        aria-label="Roles and permissions matrix table"
      >
        <table className="roles-matrix-table">
          <caption className="sr-only">
            Workspace permissions mapped across Admin, Support Agent, and Customer roles.
          </caption>
          <thead>
            <tr>
              <th scope="col" className="roles-col-perm">
                Permission
              </th>
              {roles.map((role) => (
                <th key={role.id} scope="col" className="roles-col-role">
                  <RoleHeaderCell title={role.name} subtitle={role.subtitle} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissions.map((perm) => (
              <tr key={perm.id} className="roles-tr">
                {/* Row Header: Permission Name */}
                <th scope="row" className="roles-td roles-td--perm">
                  {perm.name}
                </th>

                {/* Role Value Cells — the ADMIN column is locked: the
                    backend rejects changes and admins must never be able to
                    strip their own essential privileges. */}
                {roles.map((role) => (
                  <td
                    key={role.id}
                    className={`roles-td roles-td--role ${role.id === 'ADMIN' ? 'roles-td--admin-locked' : ''}`}
                    title={role.id === 'ADMIN' ? 'Admin permissions are locked to prevent workspace lockout' : undefined}
                  >
                    <PermissionCell
                      permId={perm.id}
                      roleId={role.id}
                      value={perm.values?.[role.id] ?? ''}
                      canEdit={canEdit && role.id !== 'ADMIN'}
                      onChange={
                        canEdit && role.id !== 'ADMIN' && onCellChange
                          ? (newVal) => onCellChange(perm.id, role.id, newVal)
                          : undefined
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
