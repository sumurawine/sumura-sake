/** basePath（本番は /sumura-sake）。ページのURLに使います。 */
export const BP = process.env.NEXT_PUBLIC_BASE_PATH || '';
/** 画像・GIF・商品データの置き場所。既定は basePath と同じです。 */
export const AB = process.env.NEXT_PUBLIC_ASSET_BASE || BP;
export const asset = (p: string) => `${AB}${p.startsWith('/') ? p : '/' + p}`;
