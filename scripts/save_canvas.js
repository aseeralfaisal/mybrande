import axios from "axios";
import { querySelect } from "./editor_page.script";
import { getTextCase, setCanvasBackground } from "./miscellaneous";
import { toastNotification } from "./toast_notification";

export async function saveCanvas(logoId, canvas, backgroundcolor, logoNameElement, sloganNameElement, alignId) {
  // const bgColor = canvas.get('backgroundColor');
  // canvas.setBackgroundImage(null);
  // canvas.setBackgroundColor(null, canvas.renderAll.bind(canvas));
  console.log("Save function triggered");
  const currentCanvasSVG = canvas.toSVG();

  if (currentCanvasSVG) {
    const getDropShadowValue = (element) => {
      if (!element) return null;
      const { blur, offsetX, offsetY } = element;
      const result = [blur ?? 0, offsetX ?? 0, offsetY ?? 0];
      const resultString = result.join(',');

      for (let i = 0; i < result.length; i++) {
        if (result[i] === result[i + 1]) {
          return "0"
        }
      }

      return resultString
    };

    const postData = {
      buyer_logo_id: querySelect("#buyer_logo_id")?.value, // from response hidden input field
      buyer_id: querySelect("#buyer_Id")?.value, // hidden input field
      logo_id: logoId, // svg data id
      brand_name: querySelect("#logoMainField").value,
      slogan: querySelect("#sloganNameField").value,
      svg_data: currentCanvasSVG,
      logo_position: alignId,
      logo_backgroundcolor: backgroundcolor,

      brandName_color: logoNameElement.get('fill'),
      brandName_fontFamely: logoNameElement.get('fontFamily'),
      brandName_fontSize: logoNameElement.get('fontSize'),
      brandName_letterCase: getTextCase(logoNameElement.text),
      brandName_fontStyle: logoNameElement.get('fontStyle'),
      brandName_letterSpace: logoNameElement.get('charSpacing') / 10,
      brandName_droupShadow: getDropShadowValue(logoNameElement.get('shadow')),

      slogan_color: sloganNameElement.get('fill'),
      slogan_fontFamely: sloganNameElement.get('fontFamily'),
      slogan_fontSize: sloganNameElement.get('fontSize'),
      slogan_letterCase: getTextCase(sloganNameElement.text),
      slogan_fontStyle: sloganNameElement.get('fontStyle'),
      slogan_letterSpace: sloganNameElement.get('charSpacing') / 10,
      slogan_droupShadow: getDropShadowValue(sloganNameElement.get('shadow')),
    };
    try {
      const response = await axios.post(`https://www.mybrande.com/api/buyer/logo/store`, postData);
      console.log(response.data)

      //canvas.setBackgroundColor(bgColor, canvas.renderAll.bind(canvas));
      //setCanvasBackground(canvas)

      if (response.status === 200) {
        const { buyer_logo_id } = response.data;
        if (!buyer_logo_id) return toastNotification("Error encountered with buyer logo ID")
        querySelect("#buyer_logo_id").value = buyer_logo_id
        toastNotification("Logo Saved Successfully");
      }
    } catch (error) {
      console.log(error)
    }
  }
}
