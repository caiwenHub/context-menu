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
} from "react";
import { createPortal } from "react-dom";
import { computePosition, offset, flip, shift } from "@floating-ui/dom";
import "./index.scss";
import { mergeRefs } from "@/utils/dom";
import { useEffect } from "react";
import clsx from "clsx";
import { ContextMenuType } from "@/types";
// import useClickCapture from '@/hooks/useClickCapture';

declare type Alignment = "start" | "end";
declare type Side = "top" | "right" | "bottom" | "left";
declare type AlignedPlacement = `${Side}-${Alignment}`;
declare type Placement = Side | AlignedPlacement;

const OUTSCREEN = -10000;

export const ContextMenu: React.FC<{
  rootid?: string; // 挂载的domId
  placement?: Placement;
  menuBoxClass?: string;
  children?: any;
  position?: {
    clientX?: number;
    clientY?: number;
  };
}> = ({
  rootid = "context_menu__dialog",
  placement,
  menuBoxClass,
  children,
  position: menuPosition,
}) => {
  const [position, setPosition] = useState<any>(menuPosition);

  const rootRef = useRef<any>(null);
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

  // 右键菜单的逻辑
  useLayoutEffect(() => {
    const onContextMenu = (e: any) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", onContextMenu, false);
    return () => {
      document.removeEventListener("contextmenu", onContextMenu, false);
    };
  }, []);

  useLayoutEffect(() => {
    if (position) {
      mergeRefs([referenceRef])({
        getBoundingClientRect() {
          return {
            x: position?.clientX,
            y: position?.clientY,
            width: 0,
            height: 0,
            top: position?.clientY,
            right: position?.clientX,
            bottom: position?.clientY,
            left: position?.clientX,
          };
        },
      });
      handleComputePosition();
    }
  }, [handleComputePosition, position]);

  // /**
  //  * 关闭弹窗
  //  */
  // useClickCapture({
  //   domRef: rootRef,
  //   callback: () => setPosition({ clientX: OUTSCREEN, clientY: OUTSCREEN }),
  // });

  useEffect(() => {
    const handleResize = () =>
      setPosition({ clientX: OUTSCREEN, clientY: OUTSCREEN });
    window.addEventListener("scroll", handleResize, false);
    return () => {
      window.removeEventListener("scroll", handleResize, false);
    };
  }, []);

  const isOpen = useMemo(() => {
    return (
      position &&
      position.clientX !== OUTSCREEN &&
      position.clientY !== OUTSCREEN
    );
  }, [position]);

  const createDom = () => {
    rootRef.current = document.getElementById(rootid);
    if (!rootRef.current) {
      rootRef.current = document.createElement("div");
      rootRef.current.id = rootid;
      document.body.appendChild(rootRef.current);
    }
    return createPortal(
      isOpen && (
        <div className="file-menu">
          <div
            className={clsx("menu-box", menuBoxClass)}
            style={{ position: "absolute", left: 0, top: 0 }}
            ref={floatRef}
          >
            {Children.map(children, (children) => {
              if (isValidElement(children)) {
                return cloneElement(children, [
                  {
                    closeMenu: () => {
                      setPosition({ clientX: OUTSCREEN, clientY: OUTSCREEN });
                    },
                  },
                ]);
              }
              return children;
            })}
          </div>
        </div>
      ),
      rootRef.current
    );
  };

  return createDom();
};

interface ContextMenuTriggerType {
  target?: string; // 当前触发右键菜单的目标分类
  className?: string;
  children?: any;
  style?: { [key: string]: any };
  data?: ContextMenuType; // 菜单数据
  updateMenuFn?: (data?: any) => void; // 更新菜单数据
  effectFn?: (data?: any) => void; // 触发鼠标右键的副作用
}

export const ContextMenuTrigger: React.FC<ContextMenuTriggerType> = ({
  target,
  data,
  children,
  style = {},
  className,
  effectFn,
  updateMenuFn,
}) => {
  const timer = useRef<any>(null);
  const handleContextMenu = useCallback(
    (e: any) => {
      effectFn && effectFn(data);
      e.preventDefault();
      e.stopPropagation();
      // 先清除一下之前的dom，避免菜单闪
      updateMenuFn &&
        updateMenuFn({
          target,
          data: [],
          position: { clientX: OUTSCREEN, clientY: OUTSCREEN },
        });
      if (!timer.current) {
        timer.current = setTimeout(() => {
          updateMenuFn &&
            updateMenuFn({
              ...(data || {}),
              position: { clientX: e.clientX, clientY: e.clientY },
            });
          clearTimeout(timer.current);
          timer.current = null;
        });
      }
    },
    [data, effectFn, target, updateMenuFn]
  );

  return (
    <div className={className} style={style} onContextMenu={handleContextMenu}>
      {children}
    </div>
  );
};

/**
 *
 * @param cb 关闭函数，用于更新state全局position
 * @returns
 */
export const closeContextMenu = (cb: (data: any) => void) =>
  cb({
    position: { clientX: OUTSCREEN, clientY: OUTSCREEN },
    data: [],
  });
