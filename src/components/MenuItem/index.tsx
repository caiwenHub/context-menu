/*
 * @Description: 包含了dropMenu,contextMenu。通过有无label区分，二级菜单用SubMenu组件渲染
 * 1,dropMenu和contextMenu都是只有一个根节点，
 * 2,通过维护一个全局数据源实现menuItem替换
 */

import React, { useMemo, useState, useEffect } from "react";
import clsx from "clsx";
// import Icon from '@ant-design/icons';
import "./index.scss";
// import Icons from '@/components/SvgIcon';
import SplitLine from "../SplitLine";

export const MenuItem: React.FC<{
  width?: number;
  label: string;
  data?: { [key: string]: any };
  checked?: boolean; // 是否选中
  children?: any;
  itemClass?: string;
  iconClass?: string;
  itemStyle?: { [key: string]: any };
  iconStyle?: { [key: string]: any };
  hasSplit?: boolean;
  disabled?: boolean; // 禁用
  iconKey?: string;
  spriteIcon?: {
    src?: string;
    disabled?: [number, number];
    default?: [number, number];
    hover?: [number, number];
    checked?: [number, number];
  }; // 雪碧图icon
  linkIcon?: {
    hover?: string;
    default?: string;
    disabled?: string;
    checked?: string;
  }; // 链接图片icon
  iconLayout?: "left" | "right";
  onClick?: (data?: any) => void; // 点击事件处理
  notifyEvent?: (data?: any) => void; // 自定义事件，主要用于子应用事件处理
  onMouseOver?: () => void;
  onMouseLeave?: () => void;
  [key: string]: any;
}> = (props) => {
  const {
    data,
    label,
    width,
    checked,
    disabled,
    hasSplit,
    linkIcon,
    itemClass,
    iconClass,
    spriteIcon,
    itemStyle = {},
    iconStyle = {},
    iconLayout = "left",
    onClick,
    notifyEvent,
    onMouseOver,
    onMouseLeave,
  } = props;

  const initIcon = (obj: any) => {
    if (checked) return obj?.checked;
    if (disabled) return obj?.disabled;
    return obj?.default;
  };

  // 雪碧图icon的位置信息
  const [spriteIconPosition, setSpriteIconPosition] = useState<
    [number, number] | undefined
  >(initIcon(spriteIcon));
  // 普通图片icon
  const [linkIconStr, setLinkIconStr] = useState<string | undefined>(
    initIcon(linkIcon)
  );

  useEffect(() => {
    setSpriteIconPosition(initIcon(spriteIcon));
    setLinkIconStr(initIcon(linkIcon));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked]);
  useEffect(() => {
    setSpriteIconPosition(initIcon(spriteIcon));
    setLinkIconStr(initIcon(linkIcon));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  const handleClick = (e: any) => {
    props[0]?.closeMenu && props[0].closeMenu();
    if (disabled) return;
    e.stopPropagation();
    onClick && onClick({ label, ...(data || {}) });
    notifyEvent && notifyEvent({ label, ...(data || {}) });
  };

  const handleMouseOver = () => {
    if (disabled || checked) return;
    if (linkIcon && isLeftLinkIcon) setLinkIconStr(linkIcon.hover);
    if (spriteIcon && isLeftSpriteIcon) {
      setSpriteIconPosition(spriteIcon?.hover);
    }
    onMouseOver && onMouseOver();
  };

  const handleMouseLeave = () => {
    if (disabled || checked) return;
    if (linkIcon && isLeftLinkIcon) setLinkIconStr(linkIcon?.default);
    if (spriteIcon && isLeftSpriteIcon) {
      setSpriteIconPosition(spriteIcon?.default);
    }
    onMouseLeave && onMouseLeave();
  };

  const isLeftSpriteIcon = useMemo(() => {
    return iconLayout === "left" && spriteIcon?.src;
  }, [iconLayout, spriteIcon]);

  const spriteIconStyle = useMemo(() => {
    return spriteIconPosition
      ? {
          backgroundImage: `url(${spriteIcon?.src || ""})`,
          backgroundPosition: `${spriteIconPosition[0]}px ${spriteIconPosition[1]}px`,
        }
      : {};
  }, [spriteIcon, spriteIconPosition]);

  const isLeftLinkIcon = useMemo(() => {
    return iconLayout === "left" && linkIcon;
  }, [iconLayout, linkIcon]);

  const linkIconStyle = useMemo(() => {
    return linkIconStr ? { backgroundImage: `url(${linkIconStr || ""})` } : {};
  }, [linkIconStr]);

  return (
    <>
      {hasSplit && <SplitLine />}
      <div
        className={clsx(
          "menu-item",
          {
            itemClass,
            "menu-item-checked": !!checked && !disabled,
          },
          disabled ? "disabled" : "active"
        )}
        style={{ width, ...itemStyle }}
        onClick={handleClick}
        onMouseOver={handleMouseOver}
        onMouseLeave={handleMouseLeave}
      >
        {/* 雪碧图icon */}
        {isLeftSpriteIcon && (
          <span
            className={clsx("menu-item__icon", {
              checked: !!checked,
              disabled: !!disabled,
              iconClass,
            })}
            style={{ ...spriteIconStyle, ...iconStyle }}
          ></span>
        )}
        {/* 链接icon */}
        {isLeftLinkIcon && (
          <span
            className={clsx("menu-item__icon", {
              checked: !!checked,
              disabled: !!disabled,
              iconClass,
            })}
            style={{ ...linkIconStyle, ...iconStyle }}
          ></span>
        )}
        {/* {iconKey && (
          <Icon component={Icons[iconKey]} style={{ marginRight: 4 }} />
        )} */}
        <span className="menu-item__lable">{label}</span>
      </div>
    </>
  );
};
