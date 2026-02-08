class Provider {
  constructor() {
    this.api = "https://api.remanga.org/api";
    this.site = "https://remanga.org";
  }

  getSettings() {
    return {
      supportsMultiLanguage: false,
      supportsMultiScanlator: true,
    };
  }

  async fetchJson(url) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "application/json",
          Referer: this.site,
        },
      });

      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }

  // В Playground search НЕ принимает текст.
  // Поэтому возвращаем список популярных тайтлов.
  async search(opts) {
    const url = `${this.api}/titles/?ordering=-rating&count=20`;

    const json = await this.fetchJson(url);
    if (!json || !json.content) return [];

    return json.content.map((item) => ({
      id: item.id, // числовой id — идеально для Playground
      title: item.rus_name || item.eng_name || item.dir,
      image: item.img?.high || item.img?.mid || item.img?.low,
    }));
  }

  async findChapters(mangaId) {
    const url = `${this.api}/titles/${mangaId}/chapters/?ordering=chapter`;

    const json = await this.fetchJson(url);
    if (!json || !json.content) return [];

    return json.content.map((ch) => ({
      id: ch.id,
      title: `Глава ${ch.chapter}`,
      chapter: ch.chapter,
    }));
  }

  async findChapterPages(chapterId) {
    const url = `${this.api}/titles/chapters/${chapterId}/`;

    const json = await this.fetchJson(url);
    if (!json || !json.content?.pages) return [];

    return json.content.pages.map((p, i) => ({
      url: p.img,
      index: i,
      headers: { Referer: this.site },
    }));
  }
}
