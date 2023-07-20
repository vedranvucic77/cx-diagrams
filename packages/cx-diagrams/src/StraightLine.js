import { Rect } from "cx/svg";
import { Container, VDOM } from "cx/ui";
import { getLinesIntersectionPoint } from "./util/getLinesIntersectionPoint";

export class StraightLine extends Container {
   declareData(...args) {
      super.declareData(...args, {
         from: undefined,
         to: undefined,
         stroke: undefined,
      });
   }

   calculateBounds(context, instance) {
      let { data } = instance;

      if (!data.from || !data.to || !context.diagram) return new Rect();

      if (!context.diagram.hasShape(data.from) || !context.diagram.hasShape(data.to)) return new Rect();
      let { bounds: sb, shape: startShape } = context.diagram.getShape(data.from);
      let { bounds: eb, shape: endShape } = context.diagram.getShape(data.to);

      let t = (sb.t + sb.b) / 2,
         l = (sb.l + sb.r) / 2,
         b = (eb.t + eb.b) / 2,
         r = (eb.l + eb.r) / 2;

      if (startShape == "circle") {
         let radius = Math.min(sb.width() / 2, sb.height() / 2);
         let { x, y } = circleIntersection(t, l, b, r, radius);
         l = x;
         t = y;
      } else if (startShape == "rectangle") {
         let { x, y } = rectIntersection(t, l, b, r, sb.width() / 2, sb.height() / 2);
         l = x;
         t = y;
      } else if (startShape == "rhombus") {
         let newPoint = rhombusIntersection(l, t, r, b, sb.width() / 2, sb.height() / 2);
         l = newPoint.x;
         t = newPoint.y;
      }
      if (endShape == "circle") {
         let radius = Math.min(eb.width() / 2, eb.height() / 2);
         let { x, y } = circleIntersection(b, r, t, l, radius);
         b = y;
         r = x;
      } else if (endShape == "rectangle") {
         let { x, y } = rectIntersection(b, r, t, l, eb.width() / 2, eb.height() / 2);
         b = y;
         r = x;
      } else if (endShape == "rhombus") {
         let newPoint = rhombusIntersection(r, b, l, t, eb.width() / 2, eb.height() / 2);
         // let point = checkAreLinesParallel(b, r, t, l, eb.width() / 2, eb.height() / 2);

         // if (!point) {
         //    const { x1, y1, x2, y2 } = getRhombusPoints(sb, eb);
         //    const intersectionPoint = getLinesIntersectionPoint(l, t, r, b, x1, y1, x2, y2);

         //    point = {
         //       x: intersectionPoint.x,
         //       y: intersectionPoint.y,
         //    };
         // }

         b = newPoint.y;
         r = newPoint.x;
      }
      return new Rect({ t, r, b, l });
   }

   prepare(context, instance) {
      instance.bounds = this.calculateBounds(context, instance);
      if (!instance.bounds.isEqual(instance.cached.bounds)) instance.markShouldUpdate(context);
      context.push("parentRect", instance.bounds);
   }

   prepareCleanup(context, instance) {
      context.pop("parentRect");
   }

   render(context, instance, key) {
      let { data, colorIndex, bounds } = instance;
      return (
         <g key={key} className={data.classNames}>
            <line
               className={this.CSS.element(this.baseClass, "line", colorIndex != null && "color-" + colorIndex)}
               x1={bounds.l}
               y1={bounds.t}
               x2={bounds.r}
               y2={bounds.b}
               style={data.style}
               stroke={data.stroke}
            />
            {this.renderChildren(context, instance)}
         </g>
      );
   }
}

StraightLine.prototype.baseClass = "line";
StraightLine.prototype.styled = true;

function circleIntersection(t, l, b, r, radius) {
   let d = Math.sqrt(Math.pow(t - b, 2) + Math.pow(r - l, 2));
   return {
      x: l + (radius / d) * (r - l),
      y: t + (radius / d) * (b - t),
   };
}

function rhombusIntersection(x1, y1, x2, y2, halfw, halfh) {
   if (x1 == x2) {
      return {
         x: x1,
         y: y2 > y1 ? y1 + halfh : y1 - halfh,
      };
   }

   if (y1 == y2) {
      return {
         y: y1,
         x: x2 > x1 ? x1 + halfw : x1 - halfw,
      };
   }

   let yt1 = y1 > y2 ? y1 - halfh : y1 + halfh;
   let xt1 = x1;

   let yt2 = y1;
   let xt2 = x1 > x2 ? x1 + halfw : x1 - halfh;

   let { x, y } = getLinesIntersectionPoint(xt1, yt1, xt2, yt2, x2, y2, x1, y1);
   // if (x1 < x2) {
   //    x1 = eb.l;
   //    y1 = (eb.t + eb.b) / 2;
   //    x2 = (eb.l + eb.r) / 2;
   //    y2 = sy < ey ? eb.t : eb.b;
   // } else {
   //    x1 = eb.r;
   //    y1 = (eb.t + eb.b) / 2;
   //    x2 = (eb.l + eb.r) / 2;
   //    y2 = sy < ey ? eb.t : eb.b;
   // }
   return { x, y };
}

function getRhombusPoints(sb, eb) {
   let sy = (sb.t + sb.b) / 2;
   let sx = (sb.l + sb.r) / 2;

   let ey = (eb.t + eb.b) / 2;
   let ex = (eb.l + eb.r) / 2;

   let x1;
   let y1;
   let x2;
   let y2;

   if (sx < ex) {
      x1 = eb.l;
      y1 = (eb.t + eb.b) / 2;
      x2 = (eb.l + eb.r) / 2;
      y2 = sy < ey ? eb.t : eb.b;
   } else {
      x1 = eb.r;
      y1 = (eb.t + eb.b) / 2;
      x2 = (eb.l + eb.r) / 2;
      y2 = sy < ey ? eb.t : eb.b;
   }

   return {
      x1,
      y1,
      x2,
      y2,
   };
}

function checkAreLinesParallel(t, l, b, r, halfw, halfh) {
   if (l == r) {
      return {
         x: l,
         y: b > t ? t + halfh : t - halfh,
      };
   }

   if (t == b) {
      return {
         y: t,
         x: r > l ? l + halfw : l - halfw,
      };
   }
}

function rectIntersection(t, l, b, r, halfw, halfh) {
   if (l == r) {
      return {
         x: l,
         y: b > t ? t + halfh : t - halfh,
      };
   }

   if (t == b) {
      return {
         y: t,
         x: r > l ? l + halfw : l - halfw,
      };
   }

   //y = k * (x - l) + t,
   //x = l + (y - t) / k
   //n = t - k * l

   let k = (b - t) / (r - l);
   let x = r > l ? l + halfw : l - halfw;
   let y = t + k * (x - l);

   if (Math.abs(y - t) > halfh) {
      y = b > t ? t + halfh : t - halfh;
      x = l + (y - t) / k;
   }

   return {
      x,
      y,
   };
}
