// Tariflere ek bilgiler: fırın ayarları (ov), pişirme yöntemi seçenekleri (v), önceden hazırlık (pre)
// ve düzeltilmiş adımlar. Diğer veri dosyalarından sonra yüklenir.
(function () {
  const R = window.RECIPES || [];
  const byId = Object.fromEntries(R.map(r => [r.id, r]));
  const set = (id, patch) => { if (byId[id]) Object.assign(byId[id], patch); };

  /* ---------- Fırın ayarları ----------
     m: 'altust' alt-üst ısıtma (fansız) · 'fan' fanlı/turbo · 'izgara' üst ızgara (grill)
     r: raf · x: not */
  const OV = (ids, spec) => ids.split(' ').forEach(id => byId[id] && (byId[id].ov = { ...spec, ...(byId[id].ov || {}) }));

  OV('karniyarik patlican-musakka', { t: 200, m: 'altust', r: 'orta', x: 'Patlıcanları ilk fırınlamada tepsiyi orta rafa koy. Dolduktan sonra da orta raf.' });
  OV('izmir-kofte hasanpasa-kofte patlican-kebabi kagit-kebabi', { t: 200, m: 'altust', r: 'orta', x: 'Folyo kapalıyken alt-üst; folyoyu açtıktan sonra üstü kızarmazsa son 5 dk ızgara moduna al.' });
  OV('testi-kebabi', { t: 180, m: 'altust', r: 'orta-alt', x: 'Toprak güveci SOĞUK fırına koy, sonra fırını aç; ani ısı çatlatır.' });
  OV('tavuk-guvec turlu', { t: 200, m: 'altust', r: 'orta', x: 'Folyolu kısımda alt-üst; folyosuz son kısımda üst kızarsın diye bir üst rafa alabilirsin.' });
  OV('yogurtlu-firin-tavuk firin-limonlu-tavuk', { t: 200, m: 'altust', r: 'orta', x: 'Patatesler tepside tek kat olsun; üst üste binerse buharlaşır, kızarmaz.' });
  OV('imam-bayildi firin-mucver firin-karnabahar', { t: 200, m: 'altust', r: 'orta' });
  OV('lazanya', { t: 190, m: 'altust', r: 'orta', x: 'Son 10 dk folyosuz; kaşar kızarmazsa son 3 dk ızgara.' });
  OV('hamsili-pilav', { t: 200, m: 'altust', r: 'orta-alt', x: 'Kalıbın altı da kızarsın diye orta-alt raf.' });
  OV('firin-levrek firin-mezgit levrek-bugulama firin-somon poke', { t: 200, m: 'altust', r: 'orta', x: 'Balık fanlıda kurur; alt-üst ısıtma daha sulu bırakır.' });
  OV('karides-guvec', { t: 220, m: 'izgara', r: 'orta-üst', x: 'Sadece gratine için: üst ızgara, güveçleri tepsiye koyup orta-üst rafa. Kaşar 6-8 dk\'da kızarır, gözünü ayırma.' });
  OV('tavuklu-borek ispanakli-borek patatesli-borek kiymali-kol-boregi spanakopita', { t: 190, m: 'altust', r: 'orta-alt', x: 'Börekte altı çiğ kalmasın diye orta-alt raf. Üstü erken kızarırsa üstüne gevşekçe folyo koy.' });
  OV('firin-sigara-boregi', { t: 200, m: 'fan', r: 'orta', x: 'Fanlı mod sigara böreğini kızartmış gibi çıtır yapar.' });
  OV('ev-lahmacun kiymali-pide tavuklu-pide lorlu-pide', { t: 240, m: 'altust', r: 'alt', x: 'Fırının en yüksek ısısı, en alt raf: hamurun altı çıtır olsun. Tepsiyi fırınla birlikte ısıtırsan daha da iyi.' });
  OV('pizza', { t: 250, m: 'altust', r: 'alt', x: 'Boş tepsiyi fırınla birlikte 250°C\'ye ısıt, pizzayı yağlı kağıtla sıcak tepsiye kaydır. En alt raf.' });
  OV('firin-tavuk-baget tatli-patates-tavuk', { t: 210, m: 'fan', r: 'orta', x: 'Fanlı mod: tavuk derisiz bile kızarır, sebzeler buharlanmaz. Tepsiyi kalabalık etme.' });
  OV('firin-patates-yumurta', { t: 210, m: 'fan', r: 'orta-üst', x: 'Patatesleri kurula, tek kat diz; fan kıtırlaştırır.' });
  OV('kadinbudu-kofte tavuk-kofte hamsi-kofte falafel-bowl', { t: 200, m: 'fan', r: 'orta', x: 'Yağlı kağıt kullan; yarısında çevir.' });
  OV('firin-hamsi firin-uskumru istavrit-firin balik-taco', { t: 220, m: 'fan', r: 'orta-üst', x: 'Küçük ve ince balıklar fanlıda hızlı ve çıtır pişer.' });
  OV('snitzel fish-and-chips', { t: 220, m: 'fan', r: 'orta-üst', x: 'Galetalı yüzeyin çıtır olması için fanlı. İki tepsi varsa patates üst, balık/şnitzel orta raf.' });
  OV('humus-tabagi saksuka', { t: 220, m: 'fan', r: 'orta-üst', x: 'Sebzeleri tek kat yay; üst üste olursa buharlanır.' });
  OV('ev-burger', { t: 220, m: 'fan', r: 'orta-üst', x: 'Patates kıtır olsun diye FANLI mod. Fansız ya da kalabalık tepside patates buharlanıp yumuşar.' });
  OV('hunkar-begendi tavuk-begendi ali-nazik', { t: 250, m: 'izgara', r: 'en üst', x: 'Patlıcan közleme: üst ızgara, en üst raf (ızgaranın 10 cm altı). Altına tepsi koy, 5 dakikada bir çevir. Gazlı ocak varsa doğrudan ateşte de közlenir.' });
  OV('fava', { t: 250, m: 'izgara', r: 'en üst', x: 'Biber közleme: üst ızgara, en üst raf; kabuğu kararınca çevir.' });

  /* ---------- Hamburger: kıtır patates ---------- */
  set('ev-burger', {
    t: 55,
    i: ["300 g|dana kıyma (az yağlı)", "0.5 adet|kuru soğan (rendelenmiş)", "0.5 çay kaşığı|tuz", "0.5 çay kaşığı|karabiber", "2 adet|hamburger ekmeği (tam buğday)", "2 dilim|kaşar peyniri", "1 adet|domates", "2 yaprak|marul", "1 adet|kırmızı soğan", "2 adet|turşu salatalık",
        "#Sos", "2 yemek kaşığı|süzme yoğurt", "1 tatlı kaşığı|hardal", "1 tatlı kaşığı|ketçap",
        "#Patates", "3 adet|patates (orta boy, nişastalı/kızartmalık)", "1 yemek kaşığı|zeytinyağı", "1 tatlı kaşığı|mısır nişastası", "1 çay kaşığı|tuz (patates)", "1 çay kaşığı|tatlı toz biber", "0.5 çay kaşığı|kekik"],
    s: [[0, "Fırını 220°C fanlı moda al, tepsiyi orta-üst rafa yerleştir. Patatesleri kabuklu ya da soyulmuş, serçe parmak kalınlığında çubuk doğra."],
        [5, "Patatesleri soğuk suya koy, 15 dk beklet: yüzeydeki nişasta gider, kıtır olur."],
        [20, "Süz ve temiz havluyla İYİCE kurula. Islak patates fırında haşlanır, kızarmaz."],
        [23, "Kuru patatesleri zeytinyağı, mısır nişastası, tuz ve baharatla bir kapta harmanla."],
        [25, "Yağlı kağıt serili tepsiye TEK KAT ve aralıklı diz (birbirine değmesin). Fırına ver; ÜSTÜNÜ KAPATMA. 15 dk pişir."],
        [27, "Kıymayı soğan, tuz ve karabiberle 1 dk hafifçe yoğur (fazla yoğurma sertleşir). 2 kalın köfte yap, ortasına başparmakla çukur aç. Buzdolabına koy."],
        [32, "Sosu karıştır; domates, kırmızı soğanı dilimle, marulu yıka-kurula."],
        [40, "Patatesleri spatula ile çevir, 10-12 dk daha pişir. Altın rengi ve kenarları kıtır olunca çıkar."],
        [42, "Izgara tavayı yüksek ateşte 2 dk kızdır. Köfteleri koy, 4 dk dokunmadan pişir."],
        [46, "Çevir, 3 dk pişir; son 1 dakikada üstüne kaşar koy, tavanın kapağını kapat ki erisin."],
        [49, "Ekmekleri kesik yüzleri aşağı, aynı tavada 30 sn ısıt."],
        [51, "Kur: alt ekmek – sos – marul – köfte – domates – soğan – turşu – üst ekmek. Patatesle servis yap."]],
    tip: "Patates yumuşak çıkıyorsa sebebi neredeyse her zaman nemdir: suda beklet, iyice kurula, tek kat diz, fanlı mod, üstünü kapatma."
  });

  /* ---------- Bakliyat: ıslatma, düdüklü, kavanoz seçenekleri ---------- */
  const pilavBulgur = (at, note = '') => [at, `Bulgur pilavı: tencerede tereyağını erit, bulguru 2 dk kavur, sıcak suyu ve tuzu ekle. Kaynayınca en kısık ateşte 15 dk pişir, ocağı kapat, kapağın altına kağıt havlu koyup 10 dk demlendir.${note}`];

  set('etli-kuru-fasulye', {
    t: 120,
    pre: { text: 'Kuru fasulyeyi bol soğuk suda ıslat (fasulyenin 3 katı su). En az 8 saat; sabah suyunu değiştir.', ing: 'kuru fasulye' },
    s: [[0, "Islatılmış fasulyeyi süz, yıka. Büyük tencerede fasulyenin 3 parmak üstüne çıkacak kadar suyla kaynat, köpüğünü al; orta-kısık ateşte 40 dk ön haşla. Tuz ekleme, kabuğu sertleşir."],
        [5, "İkinci tencerede zeytinyağını orta ateşte ısıt, eti ekle; suyunu salıp tekrar çekene kadar 12-15 dk kavur."],
        [20, "Soğanı küp doğra, ete ekle, pembeleşene kadar 5 dk kavur."],
        [25, "Salçaları ekle, kokusu çıkana kadar 2 dk çevir. Ocağı en kısığa al, fasulyeyi bekle."],
        [45, "Ön haşlanan fasulyeyi süz, ete ekle. Sıcak suyu ekle; su fasulyenin 2 parmak üstünde olmalı."],
        [47, "Kapağı kapat, kısık ateşte 55 dk pişir. 20 dakikada bir bak; su azalırsa yarım su bardağı sıcak su ekle."],
        pilavBulgur(85),
        [90, "Fasulyeye tuzu ekle, 15 dk daha pişir. Bir taneyi ez: parmak arasında kolayca eziliyorsa hazır."],
        [108, "Kırmızı soğanı ay doğra, maydanozla karıştır."],
        [115, "Ocağı kapat, 5 dk dinlendir. Pul biber serperek servis yap."]],
    v: [
      { k: 'pc', n: 'Düdüklü tencere', pc: true, t: 70,
        s: [[0, "Islatılmış fasulyeyi süz, yıka."],
            [3, "Düdüklü tencerede (kapak açık) zeytinyağını orta-yüksek ateşte ısıt, eti 12 dk suyunu salıp çekene kadar kavur."],
            [15, "Soğanı ekle 5 dk kavur, salçaları ekle 2 dk çevir."],
            [22, "Fasulye ve sıcak suyu ekle. Tuz EKLEME. Kapağı kilitle, ateşi yükselt."],
            [25, "Düdük ötünce / subap tamamen yükselince ateşi kıs: 22 dk pişir."],
            pilavBulgur(35),
            [47, "Ocağı kapat, basınç kendiliğinden düşsün (≈10 dk). Kapağı zorlayarak açma."],
            [57, "Kapağı aç, tuzu ekle, kapak açık 8 dk kaynat; kıvamı koyulaşsın."],
            [60, "Kırmızı soğanı ay doğra, maydanozla karıştır."],
            [66, "Pul biber serperek servis yap."]] },
      { k: 'kavanoz', n: 'Islatmadım → kavanoz fasulye', ns: true, t: 60,
        swap: { 'kuru fasulye': "2 kavanoz|haşlanmış kuru fasulye (konserve, 1 kavanoz ≈ 2 su bardağı)", 'sıcak su': "2 su bardağı|sıcak su" },
        s: [[0, "Zeytinyağını orta-yüksek ateşte ısıt, eti 12 dk suyunu salıp çekene kadar kavur."],
            [12, "Soğanı ekle 5 dk kavur, salçaları ekle 2 dk çevir."],
            [19, "Sıcak suyu ekle, kapağı kapat; eti kısık ateşte 25 dk yumuşat."],
            pilavBulgur(30),
            [44, "Kavanoz fasulyeyi süzgeçte bol suyla yıka (kavanoz suyu tuzlu ve köpüklüdür), tencereye ekle; kapak kapalı 10 dk pişir."],
            [54, "Tadına bak, tuzu ŞİMDİ ve az ekle: konserve zaten tuzludur. Kırmızı soğanı maydanozla karıştır."],
            [57, "Pul biber serperek servis yap."]] },
      { k: 'hizli', n: 'Islatmadım → hızlı ıslatma + düdüklü', ns: true, pc: true, t: 130,
        swap: { 'kuru fasulye': "1.5 su bardağı|kuru fasulye (ıslatılmamış)" },
        s: [[0, "Kuru fasulyeyi yıka. Tencerede 3 katı suyla kaynat, 3 dk kaynasın; ocağı kapat, kapak kapalı 1 saat beklet (bu, 8 saat ıslatmanın yerini tutar)."],
            [60, "Fasulyeyi süz, yıka. Düdüklü tencerede (kapak açık) zeytinyağında eti 12 dk kavur."],
            [72, "Soğanı ekle 5 dk kavur, salçaları ekle 2 dk çevir."],
            [79, "Fasulye ve sıcak suyu ekle, tuz ekleme. Kapağı kilitle; düdük ötünce kısık ateşte 25 dk pişir."],
            pilavBulgur(95),
            [106, "Ocağı kapat, basınç kendiliğinden düşsün (≈10 dk)."],
            [116, "Kapağı aç, tuzu ekle, kapak açık 8 dk kaynat. Kırmızı soğan-maydanozu hazırla."],
            [126, "Pul biber serperek servis yap."]] }
    ]
  });

  set('kuru-fasulye', {
    t: 100,
    pre: { text: 'Kuru fasulyeyi bol soğuk suda ıslat (3 katı su). En az 8 saat.', ing: 'kuru fasulye' },
    s: [[0, "Islatılmış fasulyeyi süz, yıka. Bol suyla kaynat, köpüğünü al; orta-kısık ateşte 40 dk ön haşla, tuz ekleme."],
        [35, "İkinci tencerede zeytinyağında doğranmış soğan ve biberi orta ateşte 5 dk kavur, salçaları ekle 2 dk çevir."],
        [42, "Haşlanan fasulyeyi süzüp ekle, sıcak suyu ekle. Kapağı kapat, kısık ateşte 40 dk pişir."],
        pilavBulgur(65),
        [80, "Tuzu ekle, 12 dk daha pişir. Fasulye parmakla eziliyorsa hazır."],
        [95, "Pul biberle, yoğurtla servis yap."]],
    v: [
      { k: 'pc', n: 'Düdüklü tencere', pc: true, t: 55,
        s: [[0, "Islatılmış fasulyeyi süz, yıka."],
            [3, "Düdüklü tencerede (kapak açık) zeytinyağında soğan ve biberi 5 dk kavur, salçaları ekle 2 dk."],
            [10, "Fasulye ve sıcak suyu ekle, tuz ekleme. Kapağı kilitle; düdük ötünce kısık ateşte 20 dk pişir."],
            pilavBulgur(20),
            [33, "Ocağı kapat, basınç kendiliğinden düşsün (≈10 dk)."],
            [43, "Kapağı aç, tuzu ekle, kapak açık 8 dk kaynat."],
            [52, "Pul biberle, yoğurtla servis yap."]] },
      { k: 'kavanoz', n: 'Islatmadım → kavanoz fasulye', ns: true, t: 35,
        swap: { 'kuru fasulye': "2 kavanoz|haşlanmış kuru fasulye (konserve)", 'sıcak su': "1.5 su bardağı|sıcak su" },
        s: [[0, "Zeytinyağında doğranmış soğan ve biberi orta ateşte 5 dk kavur, salçaları ekle 2 dk çevir."],
            pilavBulgur(5),
            [8, "Kavanoz fasulyeyi süzgeçte yıka, tencereye ekle; sıcak suyu ekle. Kapak kapalı kısık ateşte 20 dk pişir."],
            [28, "Tadına bak, tuzu az ekle (konserve tuzludur)."],
            [32, "Pul biberle, yoğurtla servis yap."]] }
    ]
  });

  set('etli-nohut', {
    t: 130,
    pre: { text: 'Nohudu bol soğuk suda ıslat (3 katı su + 1 çay kaşığı karbonat). En az 8 saat.', ing: 'nohut' },
    s: [[0, "Islatılmış nohudu süz, yıka. Bol suyla kaynat, köpüğünü al; kısık ateşte 60 dk haşla, tuz ekleme."],
        [5, "İkinci tencerede zeytinyağında eti orta-yüksek ateşte 12 dk kavur, soğanı ekleyip 5 dk daha kavur."],
        [22, "Salçayı ekle 2 dk çevir, sıcak suyun yarısını ekle; kapak kapalı kısık ateşte et pişsin."],
        [60, "Haşlanan nohudu süzüp ete ekle, kalan sıcak suyu ekle; kısık ateşte 45 dk pişir."],
        pilavBulgur(95),
        [105, "Tuz ve karabiberi ekle, 10 dk daha pişir. Nohut dilde eziliyorsa hazır."],
        [118, "Cacığı hazırla: rendelenmiş salatalık, yoğurt, tuz, nane."],
        [125, "Servis yap."]],
    v: [
      { k: 'pc', n: 'Düdüklü tencere', pc: true, t: 75,
        s: [[0, "Islatılmış nohudu süz, yıka."],
            [3, "Düdüklü tencerede (kapak açık) zeytinyağında eti 12 dk kavur, soğanı ekle 5 dk."],
            [20, "Salçayı ekle 2 dk çevir. Nohut ve sıcak suyu ekle, tuz ekleme."],
            [23, "Kapağı kilitle; düdük ötünce kısık ateşte 25 dk pişir."],
            pilavBulgur(40),
            [50, "Ocağı kapat, basınç kendiliğinden düşsün (≈10 dk)."],
            [60, "Kapağı aç, tuz-karabiber ekle, kapak açık 8 dk kaynat. Cacığı hazırla."],
            [72, "Servis yap."]] },
      { k: 'kavanoz', n: 'Islatmadım → kavanoz nohut', ns: true, t: 60,
        swap: { 'nohut': "2 kavanoz|haşlanmış nohut (konserve)", 'sıcak su': "2 su bardağı|sıcak su" },
        s: [[0, "Zeytinyağında eti orta-yüksek ateşte 12 dk kavur, soğanı ekle 5 dk."],
            [17, "Salçayı ekle 2 dk, sıcak suyu ekle; kapak kapalı kısık ateşte 25 dk eti yumuşat."],
            pilavBulgur(30),
            [44, "Kavanoz nohudu süzgeçte yıka, ekle; 10 dk pişir. Tuzu tadına bakarak az ekle."],
            [50, "Cacığı hazırla."],
            [57, "Servis yap."]] }
    ]
  });

  /* ---------- Düdüklü tencere seçenekleri (et yemekleri) ---------- */
  set('hunkar-begendi', {
    s: [[0, "Zeytinyağında kuşbaşı etleri orta-yüksek ateşte suyunu çekip kızarana kadar 10 dk kavur."],
        [10, "Doğranmış soğan ve biberi ekle 5 dk kavur. Salça ve rendelenmiş domatesi ekle, 2 dk çevir."],
        [17, "Sıcak suyu ekle, kapağı kapat, kısık ateşte 70 dk pişir. Tuzu son 15 dakikada at."],
        [20, "Patlıcanları fırının üst ızgarasında (en üst raf) ya da ocak ateşinde 5 dakikada bir çevirerek 20 dk közle."],
        [42, "Közlenen patlıcanları 5 dk poşette beklet, soy, bıçakla ince kıy, suyunu sık."],
        [70, "Beğendi: tereyağını orta ateşte erit, unu 2 dk kavur, sütü azar azar çırparak ekle; koyulaşınca patlıcanı ekle."],
        [80, "Kaşarı ve tuzu ekleyip 3 dk karıştır. Salatalık-domates salatasını doğra, limon sık."],
        [95, "Beğendiyi tabağa yay, ortasına eti koy."]],
    v: [{ k: 'pc', n: 'Düdüklü tencere', pc: true, t: 65,
      s: [[0, "Düdüklü tencerede (kapak açık) zeytinyağında eti 10 dk kavur."],
          [10, "Soğan ve biberi ekle 5 dk, salça ve domatesi ekle 2 dk çevir."],
          [17, "Sıcak suyu ekle, kapağı kilitle; düdük ötünce kısık ateşte 25 dk pişir."],
          [18, "Patlıcanları üst ızgarada (en üst raf) ya da ocakta çevirerek 20 dk közle."],
          [40, "Patlıcanları poşette 5 dk beklet, soy, kıy. Düdüklünün ocağını kapat, basınç kendiliğinden düşsün."],
          [45, "Beğendi: tereyağında unu 2 dk kavur, sütü çırparak ekle, patlıcanı ekle."],
          [52, "Kaşar ve tuzu ekle 3 dk karıştır. Eti aç, tuzunu ayarla, kapak açık 5 dk koyulaştır. Salatayı doğra."],
          [62, "Beğendiyi tabağa yay, ortasına eti koy."]] }]
  });

  set('orman-kebabi', {
    v: [{ k: 'pc', n: 'Düdüklü tencere', pc: true, t: 50,
      s: [[0, "Düdüklü tencerede (kapak açık) zeytinyağında eti 10 dk kavur."],
          [10, "Soğanı ekle 5 dk kavur, salçayı ekle 1 dk."],
          [16, "2 su bardağı sıcak suyu ekle, kapağı kilitle; düdük ötünce kısık ateşte 18 dk pişir."],
          [18, "Havuç ve patatesi küp doğra, suda beklet."],
          [34, "Ocağı kapat, basıncı düşür (subaba dokunmadan bekle ya da tencereyi musluk altında soğut)."],
          [38, "Havuç, patates, bezelye, kalan su, tuz, karabiber, kekik ekle; kapak açık orta ateşte 10 dk pişir."],
          [48, "Yoğurtla servis yap."]] }]
  });

  set('tas-kebabi', {
    v: [{ k: 'pc', n: 'Düdüklü tencere', pc: true, t: 50,
      s: [[0, "Düdüklü tencerede (kapak açık) zeytinyağında eti 12 dk kavur."],
          [12, "Soğanları ekle 6 dk, salça ve domatesi ekle 2 dk."],
          [20, "Sıcak su ve defne yaprağını ekle; kapağı kilitle, düdük ötünce kısık ateşte 22 dk pişir."],
          pilavBulgur(22),
          [42, "Basınç düşünce aç, tuz-karabiber ekle, kapak açık 4 dk kaynat. Salatayı doğra."],
          [47, "Defne yaprağını çıkar, servis yap."]] }]
  });

  set('gulas', {
    v: [{ k: 'pc', n: 'Düdüklü tencere', pc: true, t: 55,
      s: [[0, "Düdüklü tencerede (kapak açık) zeytinyağında soğanları 8 dk kavur."],
          [8, "Eti ekle 8 dk kavur; sarımsak, toz biber, kimyon ve salçayı ekle 1 dk."],
          [17, "Sıcak suyu ekle; kapağı kilitle, düdük ötünce kısık ateşte 20 dk pişir."],
          [20, "Patates, havuç ve biberi küp doğra."],
          [37, "Basıncı düşür, kapağı aç; sebzeleri, tuz ve karabiberi ekle, kapak açık 15 dk pişir."],
          [52, "Bir kaşık yoğurtla servis yap."]] }]
  });
})();

/* Detaylı adımlar ve alternatifler: DETAIL(id, toplamDakika, adımlar, alternatifler) */
window.DETAIL = (function () {
  const byId = Object.fromEntries((window.RECIPES || []).map(r => [r.id, r]));
  return (id, t, s, a) => {
    const r = byId[id];
    if (!r) { console.warn('DETAIL: tarif yok', id); return; }
    if (t) r.t = t;
    if (s) r.s = s.slice().sort((x, y) => x[0] - y[0]);
    if (a) r.a = a;
  };
})();
