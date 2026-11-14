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
                <th scope="col" className="roles-col-role">Manager</th>
                <th scope="col" className="roles-col-role">Support Agent</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(9)].map((_, i) => (
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
            Workspace permissions mapped across Admin, Manager, and Support Agent roles.
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

                {/* Role Value Cells */}
                {roles.map((role) => (
                  <td key={role.id} className="roles-td roles-td--role">
                    <PermissionCell
                      permId={perm.id}
                      roleId={role.id}
                      value={perm.values[role.id]}
                      canEdit={canEdit}
                      onChange={
                        canEdit && onCellChange
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
