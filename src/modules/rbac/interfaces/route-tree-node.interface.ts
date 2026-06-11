export interface RouteTreeNode {
  id: number;
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
