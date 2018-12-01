import { connected } from "@australis/tiny-sql-simple-repo";

export default (envKey: string) => {
  const repo = connected(
    "things",
    `/* Things */
    if not exists(select name from sys.tables where name = 'things'))
    create table things (
        id varchar(1024) NOT NULL UNIQUE default NEWID(),
        displayName varchar(max) NOT NULL,
        enabled bit not null default 0,
        nullable bit,
        createdAt DATETIME NOT NULL default GETDATE(),
        updatedAt DATETIME NOT NULL default GETDATE()
    );
`,
    envKey,
  );
  return {
    find(id: string) {
      if (id) return repo.byId(id);
      return repo.all();
    },
    remove(id: string) {
      return repo.remove(id);
    },
    add(id: string, data: any) {
        return repo.add({
            id,
            ...data
        });
    },
    update(id: string, data: any) {
        return repo.update({
            id,
            ...data
        })
    },
  }
};
