import { toastNotification } from "./toast_notification";

export async function saveCanvas(canvas, loader) {
  loader(true);
  const bgColor = canvas.get('backgroundColor');
  canvas.setBackgroundImage(null);
  canvas.setBackgroundColor(null, canvas.renderAll.bind(canvas));
  const currentCanvasSVG = canvas.toSVG();

  const currentCanvasData = JSON.stringify(canvas);
  const sellerLogoInfoId = localStorage.getItem('seller_logoinfo_id');

  const getFormattedBgColor = (bgColor) => {
    if (typeof bgColor === 'object') {
      const color = bgColor?.colorStops.map((i) => i.color);
      return color?.join(',');
    }
    return bgColor;
  };

  if (currentCanvasData && sellerLogoInfoId) {
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
      seller_logoinfo_id: sellerLogoInfoId,
      json_data: currentCanvasData,
      svg_data: currentCanvasSVG,
      logo_position: this.alignId,
      logo_backgroundcolor: bgColor === canvasBG ? 'transparent' : getFormattedBgColor(bgColor),
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
    const response = await axios.post(`https://www.mybrande.com/api/seller/logo/store`, postData);

    canvas.setBackgroundColor(bgColor, canvas.renderAll.bind(canvas));
    setCanvasBackground();

    const { logoSavedCount } = response.data;

    if (response.status === 200) {
      toastNotification(
        `You have saved ${logoSavedCount} ${logoSavedCount === 1 ? 'time' : 'times'
        }. Save at least three variants to move on to the next page`
      );
      loader(false);
      if (logoSavedCount >= 3) {
        querySelect('#third_page_btn').style.display = 'flex';
      }
      if (logoSavedCount >= 8) {
        querySelect('#save-btn').style.display = 'none';
      }
    } else {
      return toastNotification("Server Error")
    }
  }

}
