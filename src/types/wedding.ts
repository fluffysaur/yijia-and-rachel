export type EventDetails = {
  id: "ceremony" | "dinner";
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  venueName: string;
  address: string;
  attire: string;
  description: string;
  mapUrl: string;
  mapEmbedUrl: string;
};

export type GalleryImage = {
  src: string;
  alt: string;
};
