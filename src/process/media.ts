export const processImage = (item) => {
  return {
    id: item?.url,
    url: item?.url,
    image: item?.url,
    mobile: {
      url: item?.url,
    },
    desktop: {
      url: item?.url,
    },
    original: item?.url,
    thumbnail: item?.url,
  }
}

export const processVideo = (item) => {
  return {
    id: item?.url,
    url: item?.url,
    // image: item?.url,
    // mobile: {
    //   url: item?.url,
    // },
    // desktop: {
    //   url: item?.url,
    // },
    // original: item?.url,
    // thumbnail: item?.url,
  }
}

export const processAudio = (item) => {
  return {
    id: item?.url,
    url: item?.url,
    // audio: item?.url,
    // mobile: {
    //   url: item?.url,
    // },
    // desktop: {
    //   url: item?.url,
    // },
    // original: item?.url,
    // thumbnail: item?.url,
  }
}
