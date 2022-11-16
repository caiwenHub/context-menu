import React, { useRef, useCallback, isValidElement } from "react";
// import "./index.scss";
import { ContextMenuType } from "@/types";
import ContextMenuModal from "../ContextMenu";

interface ContextMenuTriggerType {
  target?: string; // 当前触发右键菜单的目标分类
  className?: string;
  children?: any;
  style?: { [key: string]: any };
  data?: ContextMenuType; // 菜单数据
  updateMenuFn?: (data?: any) => void; // 更新菜单数据
  effectFn?: (data?: any) => void; // 触发鼠标右键的副作用
}

const OUTSCREEN = -10000;

const ContextMenuTrigger: React.FC<ContextMenuTriggerType> = ({
  target,
  data,
  children,
  effectFn,
  updateMenuFn,
}) => {
  const timer = useRef<any>(null);
  const handleContextMenu = useCallback(
    (e: any) => {
      effectFn && effectFn(data);
      e.preventDefault();
      e.stopPropagation();
      // // 先清除一下之前的dom，避免菜单闪
      // updateMenuFn &&
      //   updateMenuFn({
      //     target,
      //     data: [],
      //     position: { clientX: OUTSCREEN, clientY: OUTSCREEN },
      //   });
      // if (!timer.current) {
      //   timer.current = setTimeout(() => {
      //     updateMenuFn &&
      //       updateMenuFn({
      //         ...(data || {}),
      //         position: { clientX: e.clientX, clientY: e.clientY },
      //       });
      //     clearTimeout(timer.current);
      //     timer.current = null;
      //   });
      // }
      // ContextMenuModal({
      //   position: { clientX: e.clientX, clientY: e.clientY },
      // });
      const a = ContextMenuModal.getInstance({
        position: { clientX: e.clientX, clientY: e.clientY },
      });
      a.render({
        position: { clientX: e.clientX, clientY: e.clientY },
      });
    },
    [data, effectFn]
  );

  return isValidElement(children)
    ? React.cloneElement(children, { onContextMenu: handleContextMenu } as any)
    : children;
};

export default ContextMenuTrigger;
