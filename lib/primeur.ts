// ボルドー2024 プリムールの一覧（HTML版からそのまま）
export type Lang5 = 'jp' | 'en' | 'fr' | 'zh' | 'ko';

export const AP: Array<{jp:string;la:string;zh:string;ko:string}> =[
 {jp:"サン・テステフ",la:"Saint-Estèphe",zh:"圣爱斯泰夫",ko:"생테스테프"},
 {jp:"ポイヤック",la:"Pauillac",zh:"波亚克",ko:"포이야크"},
 {jp:"サン・ジュリアン",la:"Saint-Julien",zh:"圣朱利安",ko:"생쥘리앵"},
 {jp:"マルゴー",la:"Margaux",zh:"玛歌",ko:"마고"},
 {jp:"ペサック・レオニャン",la:"Pessac-Léognan",zh:"佩萨克・雷奥良",ko:"페삭 레오냥"},
 {jp:"サン・テミリオン",la:"Saint-Émilion",zh:"圣埃美隆",ko:"생테밀리옹"}
];
export const CL: Record<string, Record<Lang5,string>> ={
 "1":{jp:"グラン クリュ 1級",en:"First Growth",fr:"1er Grand Cru Classé",zh:"列级一级庄",ko:"그랑 크뤼 1등급"},
 "2":{jp:"グラン クリュ 2級",en:"Second Growth",fr:"2e Grand Cru Classé",zh:"列级二级庄",ko:"그랑 크뤼 2등급"},
 "3":{jp:"グラン クリュ 3級",en:"Third Growth",fr:"3e Grand Cru Classé",zh:"列级三级庄",ko:"그랑 크뤼 3등급"},
 "A":{jp:"グラン クリュ クラッセ A",en:"Premier Grand Cru Classé A",fr:"Premier Grand Cru Classé A",zh:"圣埃美隆一级A等",ko:"그랑 크뤼 클라세 A"},
 "B":{jp:"AOP ボルドー",en:"AOP Bordeaux",fr:"AOP Bordeaux",zh:"AOP 波尔多",ko:"AOP 보르도"}
};
export const W: Array<[number,number,string,string,string,string,string,string,string,number,number,number]> =[
 [1,0,"シャトー コス デストゥールネル","Château Cos d’Estournel","爱士图尔庄园","샤토 코스 데스투르넬","2","93–95","96–97",25400,23700,0],
 [2,0,"シャトー モンローズ","Château Montrose","玫瑰山庄","샤토 몽로즈","2","93–95","96–97",25700,24000,0],
 [3,0,"シャトー カロン セギュール","Château Calon Ségur","卡龙世家","샤토 칼롱 세귀르","3","93–95","96–97",19300,18000,0],
 [4,1,"シャトー ラフィット ロートシルト","Château Lafite Rothschild","拉菲罗斯柴尔德","샤토 라피트 로칠드","1","91–94","96–97",85600,79900,0],
 [5,1,"カリュアド ド ラフィット ロートシルト","Carruades de Lafite Rothschild","小拉菲","카뤼아드 드 라피트 로칠드","","89–91","93–94",35600,33200,0],
 [6,1,"シャトー ムートン ロートシルト","Château Mouton Rothschild","木桐罗斯柴尔德","샤토 무통 로칠드","1","91–93","97–98",78600,73300,0],
 [7,1,"ル プティ ムートン ド ムートン ロートシルト","Le Petit Mouton de Mouton Rothschild","小木桐","르 프티 무통 드 무통 로칠드","","87–89","95–96",31100,29100,0],
 [8,1,"シャトー ピション ロングヴィル ラランド","Château Pichon Longueville Comtesse de Lalande","碧尚女爵","샤토 피숑 롱그빌 라랑드","2","91–93","95–96",25000,23300,0],
 [9,1,"シャトー ピション バロン","Château Pichon Baron","碧尚男爵","샤토 피숑 바롱","2","90–93","95–96",22700,21200,0],
 [10,2,"シャトー レオヴィル ラスカーズ","Château Léoville Las Cases","雄狮庄园","샤토 레오빌 라스 카즈","2","93–95","97–98",27000,25200,0],
 [11,2,"シャトー レオヴィル ポワフェレ","Château Léoville Poyferré","波菲庄园","샤토 레오빌 푸아페레","2","89–91","94–95",13700,12800,0],
 [12,2,"シャトー レオヴィル バルトン","Château Léoville Barton","巴顿庄园","샤토 레오빌 바르통","2","92–94","95–96",14600,13600,0],
 [13,3,"シャトー マルゴー","Château Margaux","玛歌庄园","샤토 마고","1","93–95","97–98",83600,78000,1],
 [14,3,"パヴィヨン ルージュ デュ シャトー マルゴー","Pavillon Rouge du Château Margaux","玛歌红亭","파비용 루즈 뒤 샤토 마고","","90–93","95–96",26000,24300,0],
 [15,3,"パヴィヨン ブラン デュ シャトー マルゴー","Pavillon Blanc du Château Margaux","玛歌白亭","파비용 블랑 뒤 샤토 마고","B","93–94","98–99",67900,63300,0],
 [16,3,"シャトー パルメ","Château Palmer","宝马庄园","샤토 팔머","2","93–95","95–96",50000,46700,0],
 [17,3,"シャトー ジスクール","Château Giscours","美人鱼庄园","샤토 지스쿠르","3","93–95","94–95",9900,9200,0],
 [18,3,"シャトー ローザン セグラ","Château Rauzan-Ségla","鲁臣世家","샤토 로장 세글라","2","89–92","93–94",14600,13600,0],
 [19,4,"シャトー オー ブリオン","Château Haut-Brion","侯伯王庄园","샤토 오브리옹","1","93–95","97–98",71300,66500,0],
 [20,4,"ル クラランス ド オー ブリオン","Le Clarence de Haut-Brion","侯伯王副牌","르 클라랑스 드 오브리옹","","90–92","94–95",25100,23500,0],
 [21,4,"シャトー オー ブリオン ブラン","Château Haut-Brion Blanc","侯伯王白葡萄酒","샤토 오브리옹 블랑","1","93–94","98–99",192900,180000,1],
 [22,5,"シャトー シュヴァル ブラン","Château Cheval Blanc","白马庄园","샤토 슈발 블랑","A","94–96","96–97",85700,80000,1],
 [23,5,"シャトー オーゾンヌ","Château Ausone","欧颂庄园","샤토 오존","A","91–93","97–98",98600,92000,1]
];

export const UI: Record<Lang5, { one: string; six: string; adj: string; cnt: string; locale: string; suffix: 'yen' | 'mark' | 'trail' }> = {
  jp: { one: '1本', six: '6本以上 / 1本あたり', adj: '※ 数量調整の可能性', cnt: '銘柄', locale: 'ja-JP', suffix: 'yen' },
  en: { one: 'Single bottle', six: '6 bottles / per bottle', adj: '* allocation may be adjusted', cnt: 'wines', locale: 'en-US', suffix: 'mark' },
  fr: { one: 'À la bouteille', six: '6 bouteilles / l’unité', adj: '* quantité susceptible d’être ajustée', cnt: 'vins', locale: 'fr-FR', suffix: 'trail' },
  zh: { one: '单瓶', six: '6瓶以上 / 每瓶', adj: '※ 可能需要调整数量', cnt: '款', locale: 'en-US', suffix: 'mark' },
  ko: { one: '1병', six: '6병 이상 / 1병당', adj: '※ 수량 조정 가능성', cnt: '종', locale: 'en-US', suffix: 'mark' },
};

export function yen(n: number, lang: Lang5): string {
  const u = UI[lang];
  const s = n.toLocaleString(u.locale);
  if (u.suffix === 'yen') return s + '円';
  if (u.suffix === 'trail') return s + ' ¥';
  return '¥' + s;
}
