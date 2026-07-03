export interface RouteTreeNode {
  id: number;
  parentId: number | null;
  name: string;
  code: string;
  type: number;
  path?: string;
  component?: string;
  icon?: string;
  permissionCode?: string;
  sort: number;
  children: RouteTreeNode[];
}
