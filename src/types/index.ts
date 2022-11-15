export interface ContextMenuType {
  /**当前菜单目标 */
  target?: string;
  /**菜单列表数据 */
  data?: MenuItemType[];
  /**鼠标右键的位置信息 */
  position?: {
    clientX?: number;
    clientY?: number;
  };
}

export interface MenuItemType {
  label: string;
  value?: any;
  key?: string;
  checked?: boolean;
  disabled?: boolean;
  /**控制是否展示图标 */
  isSelect?: boolean;
  iconKey?: string;
  /**雪碧图icon */
  spriteIcon?: {
    src?: string;
    disabled?: [number, number];
    default?: [number, number];
    hover?: [number, number];
    checked?: [number, number];
  };
  /**链接图片icon */
  linkIcon?: {
    disabled?: string;
    default?: string;
    hover?: string;
    checked?: string;
  };
  children?: MenuItemType[];
  iconLayout?: "left" | "right";
  /**是否有分割线 */
  hasSplit?: boolean;
  onClick?: (data?: { [key: string]: any }) => void;
}
