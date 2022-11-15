import React, {
  useRef,
  useMemo,
  useState,
  Children,
  useEffect,
  cloneElement,
  isValidElement,
  useLayoutEffect,
} from "react";
import { computePosition, flip, shift, offset } from "@floating-ui/dom";
import clsx from "clsx";
// import Icon from '@ant-design/icons';
import "./index.scss";
// import Icons from '@/components/SvgIcon';
import SplitLine from "../SplitLine";

const SubMenu: React.FC<{
  label: any;
  disabled?: boolean;
  menuClass?: string;
  children?: any;
  childClass?: string;
  hasSplit?: boolean;
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
  [key: string]: any;
}> = (props) => {
  const {
    label,
    children,
    disabled,
    hasSplit,
    menuClass,
    childClass,
    spriteIcon,
    iconLayout = "left",
  } = props;
  const [open, setOpen] = useState(false);

  const referenceRef = useRef<any>(null);
  const floatRef = useRef<any>(null);

  const initIcon = (obj: any) => {
    if (disabled) return obj?.disabled;
    return obj?.default;
  };

  // 雪碧图icon的位置信息
  const [spriteIconPosition, setSpriteIconPosition] = useState<
    [number, number] | undefined
  >(initIcon(spriteIcon));

  useLayoutEffect(() => {
    if (referenceRef.current && floatRef.current && open) {
      computePosition(referenceRef.current, floatRef.current, {
        placement: "right-start",
        middleware: [offset({ mainAxis: -10 }), flip(), shift()],
      }).then(({ x, y }) => {
        Object.assign(floatRef.current.style, {
          left: `${x}px`,
          top: `${y}px`,
          position: "absolute",
        });
      });
    }
  }, [referenceRef, floatRef, open]);

  useEffect(() => {
    setSpriteIconPosition(initIcon(spriteIcon));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  const handleMouseOver = () => {
    if (disabled) return;
    if (spriteIcon && isLeftSpriteIcon) {
      setSpriteIconPosition(spriteIcon?.hover);
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    if (spriteIcon && isLeftSpriteIcon) {
      setSpriteIconPosition(spriteIcon?.default);
    }
    setOpen(false);
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

  return (
    <>
      {hasSplit && <SplitLine />}
      <div
        ref={referenceRef}
        onMouseOver={handleMouseOver}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          "sub-menu",
          menuClass,
          disabled ? "disabled" : "active"
        )}
      >
        {/* 雪碧图icon */}
        {isLeftSpriteIcon && (
          <span
            className={clsx("sub-menu__icon", {
              disabled: !!disabled,
            })}
            style={{ ...spriteIconStyle }}
          ></span>
        )}

        {/* {iconKey && (
          <Icon component={Icons[iconKey]} style={{ marginRight: 4 }} />
        )} */}
        {label}
        {open && (
          <div
            className={clsx("sub-menu__child", childClass)}
            style={{ position: "absolute", left: 0, top: 0 }}
            ref={floatRef}
          >
            {Children.map(children, (children) => {
              if (isValidElement(children)) {
                return cloneElement(children, [
                  { closeMenu: props[0]?.closeMenu },
                ]);
              }
              return children;
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default SubMenu;
