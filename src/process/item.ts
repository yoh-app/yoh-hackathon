import { processImage, processAudio, processVideo } from './media';
const processItem = (item) => {
  const image = processImage(item?.imageObj);
  const video = processVideo(item?.videoObj);
  const audio = processAudio(item?.audioObj);
  const gallery =
    item?.gallery?.length > 0
      ? item.gallery?.map((imageObj) => {
        return processImage(imageObj);
      })
      : [];
  const variation_options = item?.variation_options?.filter(
    (variation_option) => !!variation_option.price && !!variation_option.quantity,
  )

  const variations = item?.variations?.flatMap(({ value, attribute }: any) =>
    value?.map((value: any) => ({
      attribute_value_id: value.id,
      ...value,
      attribute,
    })),
  )

  const min_price =
    item?.productType === 'variable' && variation_options
      ? parseFloat(
        variation_options?.reduce(function (p, v) {
          return parseFloat(p.price) < parseFloat(v.price) ? p : v;
        }, 0)?.price,
      )
      : undefined;
  const max_price =
    item?.productType === 'variable' && variation_options
      ? parseFloat(
        variation_options?.reduce(function (p, v) {
          return parseFloat(p.price) > parseFloat(v.price) ? p : v;
        }, 0)?.price,
      )
      : undefined;
  let quantity = item?.quantity ?? 0;
  if (item?.productType === 'variable') {
    quantity = 0;
    variation_options.forEach((element) => {
      quantity += parseInt(element.quantity);
    });
  } else if (item?.productType === 'digital') {
    quantity = 1;
  }

  return JSON.parse(JSON.stringify({
    ...item,
    variations,
    variation_options,
    image,
    gallery,
    video,
    audio,
    min_price,
    max_price,
    quantity,
  }));
};

export default processItem;
