import processItem from './item';
const processPage = (page) => {
  page.requests = page?.requests?.filter((request) => request?.requestStatus === 'active').map((request) => processItem(request))
  page.items = page?.items
    ?.filter((item) => page.itemIds.indexOf(item.id) > -1 && !item.deleted)
    .sort(function (a, b) {
      return page.itemIds.indexOf(a.id) - page.itemIds.indexOf(b.id);
    })
    .map((item) => {
      if (item.collection) {
        let data = [];
        if (item.collection.products) {
          data = [
            ...data,
            ...item.collection.products.filter((product) => product.active && !product.deleted).map((product) => {
              // const userOrderedProduct = product.orderedProducts.find((orderedProduct) => orderedProduct?.order?.customer?.user?.id === userId);

              return {
                ...processItem(product),
                // orderedProduct: userOrderedProduct,
                itemType: 'product',
              };
            }),
          ];
        }
        if (item.collection.pages) {
          data = [
            ...data,
            ...item.collection.pages.map((page) => {
              return {
                ...processItem(page),
                itemType: 'page',
              };
            }),
          ];
        }
        if (item.collection.links) {
          data = [
            ...data,
            ...item.collection.links.map((link) => {
              return {
                ...processItem(link),
                itemType: 'link',
              };
            }),
          ];
        }
        item.collection.data = data;
        return item;
      }
      return item;
    });

  return JSON.parse(JSON.stringify(page));
};

export default processPage;
