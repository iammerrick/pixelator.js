(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.Pixelator = factory();
  }
}(this, function() {

  function Pixel(context, x, y, width, height, style) {
    this.context = context;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.style = style;
  };

  Pixel.prototype.draw = function() {
    this.context.fillStyle = this.style;
    this.context.fillRect(this.x, this.y, this.width, this.height);
  };

  function Pixelator(options) {
    this.target = options.target;
    this.el = $('<canvas />').get(0);
    this.el.width = options.width;
    this.el.height = options.height;

    this.context = this.el.getContext('2d');
    this.size = options.size || 40;
  };

  Pixelator.prototype.pixelate = function() {
    this.context.drawImage(this.target, 0, 0, this.el.width, this.el.height);

    this.pixels = this.pixelationOf(this.context.getImageData(0, 0, this.el.width, this.el.height))

    this.pixels.forEach(function(pixel) {
      pixel.draw();
    });

    return this;
  };

  Pixelator.prototype.setSize = function(size) {
    this.size = size;
    return this;
  };


  Pixelator.prototype.pixelationOf = function(imageData) {
    var length = imageData.data.length;
    var width = imageData.width;
    var height = imageData.height;
    var rows = length / width;
    var data = imageData.data;
    var size = this.size;
    var pixels = [];

    function average(start) {
      var colors = [0, 0, 0, 0];

      for (var row = 0; row < size; row++) {
        for (var column = 0; column < size; column++) {
          var index = ((row * width + column) * 4) + start;
          colors[0] += data[index];
          colors[1] += data[index + 1];
          colors[2] += data[index + 2];
          colors[3] += data[index + 3];
        }
      }

      colors = colors.map(function(color){
        var normalizer = size * size;
        return Math.floor(color / normalizer);
      });

      return 'rgba('+colors.join(',')+')';


    }

    for (var row = 0; row < height; row += size) {
      for (var column = 0; column < width; column += size) {
        var index = (row * width + column) * 4;
        pixels.push(new Pixel(this.context, column, row, size, size, average(index)));
      }
    }

    return pixels;
  };

  Pixelator.prototype.getImageData = function(image) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return context.getImageData(0, 0, canvas.width, canvas.height);
  };

  return Pixelator;

}));
