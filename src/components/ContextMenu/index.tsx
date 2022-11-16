/*
 * @Description: 包含了dropMenu,contextMenu。通过有无label区分，二级菜单用SubMenu组件渲染
 * 1,dropMenu和contextMenu都是只有一个根节点，
 * 2,通过维护一个全局数据源实现menuItem替换
 */

import React, {
  useRef,
  useMemo,
  useState,
  Children,
  useCallback,
  cloneElement,
  isValidElement,
  useLayoutEffect,
  ReactElement,
  JSXElementConstructor,
} from "react";
import {
  createPortal,
  render as ReactRender,
  unmountComponentAtNode as reactUnmount,
} from "react-dom";
import { computePosition, offset, flip, shift } from "@floating-ui/dom";
import "./index.scss";
import { mergeRefs } from "../../utils/dom";
import { useEffect } from "react";
import clsx from "clsx";
import ReactDOM from "react-dom/client";
// import "./index.css";

declare type Alignment = "start" | "end";
declare type Side = "top" | "right" | "bottom" | "left";
declare type AlignedPlacement = `${Side}-${Alignment}`;
declare type Placement = Side | AlignedPlacement;

const OUTSCREEN = -10000;

interface MenuType {
  rootid?: string; // 挂载的domId
  placement?: Placement;
  menuBoxClass?: string;
  children?: any;
  position?: {
    clientX?: number;
    clientY?: number;
  };
  open?: boolean;
}

const ContextMenu: React.FC<{
  root?: any; // 挂载的domId
  placement?: Placement;
  menuBoxClass?: string;
  children?: any;
  position?: {
    clientX?: number;
    clientY?: number;
  };
  open?: boolean;
}> = ({
  root,
  open,
  placement,
  menuBoxClass,
  children,
  position: menuPosition,
}) => {
  const [position, setPosition] = useState<any>(menuPosition);

  const rootRef = useRef<any>(root);
  const referenceRef = useRef<any>(null); // 参照dom
  const floatRef = useRef<any>(null); // 浮动dom

  useEffect(() => {
    setPosition(menuPosition);
  }, [menuPosition]);

  /**
   * 根据参照dom计算浮动dom的位置
   */
  const handleComputePosition = useCallback(() => {
    if (referenceRef.current && floatRef.current) {
      computePosition(referenceRef.current, floatRef.current, {
        placement: placement || "right-start",
        middleware: [
          offset({ mainAxis: 5, alignmentAxis: 4 }),
          flip(),
          shift(),
        ],
      }).then(({ x, y }) => {
        Object.assign(floatRef.current.style, {
          left: `${x}px`,
          top: `${y}px`,
          position: "absolute",
        });
      });
    }
  }, [referenceRef, floatRef, placement]);

  // 禁用默认右键菜单
  useLayoutEffect(() => {
    const onContextMenu = (e: any) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", onContextMenu, false);
    return () => {
      document.removeEventListener("contextmenu", onContextMenu, false);
    };
  }, []);

  // 计算更新菜单位置
  useLayoutEffect(() => {
    if (position) {
      const { clientX: x, clientY: y } = position;
      mergeRefs([referenceRef])({
        getBoundingClientRect() {
          return {
            x,
            y,
            width: 0,
            height: 0,
            top: y,
            right: x,
            bottom: y,
            left: x,
          };
        },
      });
      handleComputePosition();
    }
  }, [handleComputePosition, position]);

  // useEffect(() => {
  //   const handleResize = () =>
  //     setPosition({ clientX: OUTSCREEN, clientY: OUTSCREEN });
  //   window.addEventListener("scroll", handleResize, false);
  //   return () => {
  //     window.removeEventListener("scroll", handleResize, false);
  //   };
  // }, []);

  // const isOpen = useMemo(() => {
  //   return (
  //     position &&
  //     position.clientX !== OUTSCREEN &&
  //     position.clientY !== OUTSCREEN
  //   );
  // }, [position]);

  // const createDom = () => {
  //   // rootRef.current = document.getElementById(rootid);
  //   // if (!rootRef.current) {
  //   //   rootRef.current = document.createElement("div");
  //   //   rootRef.current.id = rootid;
  //   //   document.body.appendChild(rootRef.current);
  //   // }
  //   return createPortal(
  //     open && (
  //       <div className="context-menu">
  //         <div
  //           className={clsx("context-menu__content", menuBoxClass)}
  //           style={{ position: "absolute", left: 0, top: 0 }}
  //           ref={floatRef}
  //         >
  //           {Children.map(children, (children) => {
  //             if (isValidElement(children)) {
  //               return cloneElement(children, [
  //                 {
  //                   closeMenu: () => {
  //                     setPosition({ clientX: OUTSCREEN, clientY: OUTSCREEN });
  //                   },
  //                 },
  //               ]);
  //             }
  //             return children;
  //           })}
  //         </div>
  //       </div>
  //     ),
  //     rootRef.current
  //   );
  // };

  // return createDom();

  useEffect(() => {
    console.log(6666666, open);
  }, [open]);
  return open ? (
    <div className="context-menu">
      <div
        className={clsx("context-menu__content", menuBoxClass)}
        style={{ position: "absolute", left: 0, top: 0 }}
        ref={floatRef}
      >
        {Children.map(children, (children) => {
          if (isValidElement(children)) {
            return cloneElement(children);
          }
          return children;
        })}
      </div>
    </div>
  ) : (
    <></>
  );
};

interface ContextMenuModalPropsType {
  mountedId?: string;
  position: {
    clientX: number;
    clientY: number;
  };
}

let menuDom: any = null;
let root: any = null;
let component: any = null;
let isOpen = false;

// export const ContextMenuModal = (props: ContextMenuModalPropsType) => {
//   const { position } = props;
//   isOpen = true;
//   component = (
//     <ContextMenu open={true} position={position}>
//       <div>123123123</div>
//       <div>456456456</div>
//     </ContextMenu>
//   );

//   menuDom = document.getElementById("context_menu");

//   const close = () => {
//     if (menuDom && root) {
//       root.render(cloneElement(component, { open: false }));
//       root.unmount();
//       root = null;
//       component = null;
//       menuDom.remove();
//       isOpen = false;
//     }
//   };

//   if (menuDom) {
//     close();
//   }

//   menuDom = document.createElement("div");
//   menuDom.id = "context_menu";

//   document.body.appendChild(menuDom);

//   root = ReactDOM.createRoot(menuDom as HTMLElement);

//   const handleClose = () => {
//     console.log(11111111, "click");
//     close();
//   };

//   if (isOpen) {
//     window.addEventListener("click", handleClose, true);
//     window.addEventListener("scroll", close, true);
//   } else {
//     window.removeEventListener("scroll", close, true);
//     window.removeEventListener("click", handleClose, true);
//   }
//   root.render(component);
// };

// export default ContextMenu;

class ContextMenuModal {
  // static getInstance(arg0: { position: { clientX: any; clientY: any } }) {
  //   throw new Error("Method not implemented.");
  // }
  position: {
    clientX: number;
    clientY: number;
  };
  component: ReactElement | null;
  menuDom: Element | null;
  root: any;
  static instance: any;

  constructor(props?: ContextMenuModalPropsType) {
    const { mountedId = "context_menu_modal" } = props || {};
    this.menuDom = document.getElementById(mountedId);
    if (!this.menuDom) {
      this.menuDom = document.createElement("div");
      this.menuDom.id = "context_menu_modal";
    }
    document.body.appendChild(this.menuDom);
    this.position = { clientX: -1000, clientY: -1000 };
    this.component = null;
    this.root = ReactDOM.createRoot(this.menuDom as HTMLElement);
  }
  /**
   * 单一实例
   * @param props
   * @returns
   */
  static getInstance(props?: ContextMenuModalPropsType) {
    if (!this.instance) {
      this.instance = new ContextMenuModal(props);
    }
    return this.instance;
  }
  render(props: ContextMenuModalPropsType) {
    const { position } = props || {};
    this.component = (
      <ContextMenu position={position} open={true}>
        <div>234234234</div>
        <div>234234234</div>
        <div>234234234</div>
        <div>234234234</div>
        <div>234234234</div>
        <div>234234234</div>
        <div>234234234</div>
        <div>234234234</div>
        <div>234234234</div>
        <div>234234234</div>
        <div>234234234</div>
        <div>234234234</div>
        <div>234234234</div>
        <div>234234234</div>
        <div>234234234</div>
        <div>234234234</div>
        <div>234234234</div>
        <div>234234234</div>
        <div>234234234</div>
        <div>234234234</div>
        <div>234234234</div>
      </ContextMenu>
    );
    window.addEventListener("click", this.close.bind(this), true);
    this.root.render(this.component);
  }
  destroy() {
    if (this.menuDom && this.component) {
      this.root.render(cloneElement(this.component, { open: false }));
      this.root.unmount();
      this.menuDom.remove();
      this.menuDom = null;
      this.component = null;
    }
  }
  close() {
    if (this.menuDom && this.component) {
      this.root.render(cloneElement(this.component, { open: false }));
      this.component = null;
    }
    window.removeEventListener("click", this.close.bind(this), true);
  }
}

export default ContextMenuModal;
