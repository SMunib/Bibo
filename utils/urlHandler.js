const baseUrl = `http://localhost:${process.env.PORT || 3000}/`;

function formatProductData(product) {
  return {
    ...product.toJSON(),
    displayPicture: `${baseUrl}${product.displayPicture}`,
  };
}

module.exports = formatProductData;
