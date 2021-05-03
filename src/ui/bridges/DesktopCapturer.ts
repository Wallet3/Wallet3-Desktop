interface Size {
  // Docs: https://electronjs.org/docs/api/structures/size

  height: number;
  width: number;
}

interface SourcesOptions {
  /**
   * An array of Strings that lists the types of desktop sources to be captured,
   * available types are `screen` and `window`.
   */
  types: string[];
  /**
   * The size that the media source thumbnail should be scaled to. Default is `150` x
   * `150`. Set width or height to 0 when you do not need the thumbnails. This will
   * save the processing time required for capturing the content of each window and
   * screen.
   */
  thumbnailSize?: Size;
  /**
   * Set to true to enable fetching window icons. The default value is false. When
   * false the appIcon property of the sources return null. Same if a source has the
   * type screen.
   */
  fetchWindowIcons?: boolean;
}

interface Rectangle {
  // Docs: https://electronjs.org/docs/api/structures/rectangle

  /**
   * The height of the rectangle (must be an integer).
   */
  height: number;
  /**
   * The width of the rectangle (must be an integer).
   */
  width: number;
  /**
   * The x coordinate of the origin of the rectangle (must be an integer).
   */
  x: number;
  /**
   * The y coordinate of the origin of the rectangle (must be an integer).
   */
  y: number;
}

interface ToBitmapOptions {
  /**
   * Defaults to 1.0.
   */
  scaleFactor?: number;
}

interface ToDataURLOptions {
  /**
   * Defaults to 1.0.
   */
  scaleFactor?: number;
}

interface ToPNGOptions {
  /**
   * Defaults to 1.0.
   */
  scaleFactor?: number;
}

interface AddRepresentationOptions {
  /**
   * The scale factor to add the image representation for.
   */
  scaleFactor: number;
  /**
   * Defaults to 0. Required if a bitmap buffer is specified as `buffer`.
   */
  width?: number;
  /**
   * Defaults to 0. Required if a bitmap buffer is specified as `buffer`.
   */
  height?: number;
  /**
   * The buffer containing the raw image data.
   */
  buffer?: Buffer;
  /**
   * The data URL containing either a base 64 encoded PNG or JPEG image.
   */
  dataURL?: string;
}

interface BitmapOptions {
  /**
   * Defaults to 1.0.
   */
  scaleFactor?: number;
}

interface ResizeOptions {
  /**
   * Defaults to the image's width.
   */
  width?: number;
  /**
   * Defaults to the image's height.
   */
  height?: number;
  /**
   * The desired quality of the resize image. Possible values are `good`, `better`,
   * or `best`. The default is `best`. These values express a desired quality/speed
   * tradeoff. They are translated into an algorithm-specific method that depends on
   * the capabilities (CPU, GPU) of the underlying platform. It is possible for all
   * three methods to be mapped to the same algorithm on a given platform.
   */
  quality?: string;
}

interface NativeImage {
  // Docs: https://electronjs.org/docs/api/native-image

  /**
   * Add an image representation for a specific scale factor. This can be used to
   * explicitly add different scale factor representations to an image. This can be
   * called on empty images.
   */
  addRepresentation(options: AddRepresentationOptions): void;
  /**
   * The cropped image.
   */
  crop(rect: Rectangle): NativeImage;
  /**
   * The image's aspect ratio.
   *
   * If `scaleFactor` is passed, this will return the aspect ratio corresponding to
   * the image representation most closely matching the passed value.
   */
  getAspectRatio(scaleFactor?: number): number;
  /**
   * A Buffer that contains the image's raw bitmap pixel data.
   *
   * The difference between `getBitmap()` and `toBitmap()` is that `getBitmap()` does
   * not copy the bitmap data, so you have to use the returned Buffer immediately in
   * current event loop tick; otherwise the data might be changed or destroyed.
   */
  getBitmap(options?: BitmapOptions): Buffer;
  /**
   * A Buffer that stores C pointer to underlying native handle of the image. On
   * macOS, a pointer to `NSImage` instance would be returned.
   *
   * Notice that the returned pointer is a weak pointer to the underlying native
   * image instead of a copy, so you _must_ ensure that the associated `nativeImage`
   * instance is kept around.
   *
   * @platform darwin
   */
  getNativeHandle(): Buffer;
  /**
   * An array of all scale factors corresponding to representations for a given
   * nativeImage.
   */
  getScaleFactors(): number[];
  /**
   * If `scaleFactor` is passed, this will return the size corresponding to the image
   * representation most closely matching the passed value.
   */
  getSize(scaleFactor?: number): Size;
  /**
   * Whether the image is empty.
   */
  isEmpty(): boolean;
  /**
   * Whether the image is a template image.
   */
  isTemplateImage(): boolean;
  /**
   * The resized image.
   *
   * If only the `height` or the `width` are specified then the current aspect ratio
   * will be preserved in the resized image.
   */
  resize(options: ResizeOptions): NativeImage;
  /**
   * Marks the image as a template image.
   */
  setTemplateImage(option: boolean): void;
  /**
   * A Buffer that contains a copy of the image's raw bitmap pixel data.
   */
  toBitmap(options?: ToBitmapOptions): Buffer;
  /**
   * The data URL of the image.
   */
  toDataURL(options?: ToDataURLOptions): string;
  /**
   * A Buffer that contains the image's `JPEG` encoded data.
   */
  toJPEG(quality: number): Buffer;
  /**
   * A Buffer that contains the image's `PNG` encoded data.
   */
  toPNG(options?: ToPNGOptions): Buffer;
  isMacTemplateImage: boolean;
}

interface DesktopCapturerSource {
  // Docs: https://electronjs.org/docs/api/structures/desktop-capturer-source

  /**
   * An icon image of the application that owns the window or null if the source has
   * a type screen. The size of the icon is not known in advance and depends on what
   * the application provides.
   */
  appIcon: NativeImage;
  /**
   * A unique identifier that will correspond to the `id` of the matching Display
   * returned by the Screen API. On some platforms, this is equivalent to the `XX`
   * portion of the `id` field above and on others it will differ. It will be an
   * empty string if not available.
   */
  display_id: string;
  /**
   * The identifier of a window or screen that can be used as a `chromeMediaSourceId`
   * constraint when calling [`navigator.webkitGetUserMedia`]. The format of the
   * identifier will be `window:XX` or `screen:XX`, where `XX` is a random generated
   * number.
   */
  id: string;
  /**
   * A screen source will be named either `Entire Screen` or `Screen <index>`, while
   * the name of a window source will match the window title.
   */
  name: string;
  /**
   * A thumbnail image. **Note:** There is no guarantee that the size of the
   * thumbnail is the same as the `thumbnailSize` specified in the `options` passed
   * to `desktopCapturer.getSources`. The actual size depends on the scale of the
   * screen or window.
   */
  thumbnail: NativeImage;
}

interface DesktopCapturerApi {
  getSources(options: SourcesOptions): Promise<DesktopCapturerSource[]>;
}

const API_KEY = 'wallet3_capturer';
const api = window[API_KEY] as DesktopCapturerApi;

export default api;
