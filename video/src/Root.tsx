import { Composition } from "remotion";
import { Promo } from "./Promo";

export const Root = () => {
  return (
    <>
      <Composition
        id="Promo"
        component={Promo}
        durationInFrames={30 * 22}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PromoVertical"
        component={Promo}
        durationInFrames={30 * 22}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ vertical: true }}
      />
    </>
  );
};
