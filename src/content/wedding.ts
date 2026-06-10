import type { EventDetails, GalleryImage } from "../types/wedding";

const weddingDate = "2027-06-19";

export const siteContent = {
    couple: {
        names: "Yi Jia & Rachel",
        firstNames: "Yi Jia and Rachel",
        dateLabel: "19 June 2027",
        locationLabel: "Singapore",
    },
    navigation: [
        { href: "#story", label: "Story" },
        { href: "#events", label: "Details" },
        { href: "#gallery", label: "Gallery" },
        { href: "#qa", label: "Q&A" },
        { href: "#faq", label: "FAQ" },
        { href: "#contact", label: "Contact" },
    ],
    hero: {
        eyebrow: "We are getting married",
        headline: "Yi Jia & Rachel",
        body: "A gentle celebration of faith, family, and the people who have walked with us.",
        image: "https://images.unsplash.com/photo-1513278974582-3e1b4a4fa21e?auto=format&fit=crop&w=2000&q=88",
        imageAlt: "Soft white wedding bouquet with warm natural light",
    },
    story: {
        title: "Our Story",
        paragraphs: [
            "This is a placeholder for the story of how we met, grew together, and arrived at this season.",
            "Replace this copy with a few short paragraphs that feel personal and easy for guests to read before the wedding day.",
        ],
    },
    events: [
        {
            id: "ceremony",
            title: "Church Wedding Ceremony & Lunch Buffet",
            date: weddingDate,
            startTime: "11:00",
            endTime: "14:00",
            venueName: "Paya Lebar Methodist Church",
            address: "5 Boundary Rd, Singapore 549954",
            attire: "Smart casual, Sunday best",
            description:
                "A church wedding ceremony followed by a lunch buffet. All invited attendees are invited for this portion.",
            mapUrl: "https://maps.app.goo.gl/ULs7t9s9KTgipg4f8",
            mapEmbedUrl:
                "https://maps.google.com/maps?q=Paya+Lebar+Methodist+Church,+5+Boundary+Rd,+Singapore+549954&output=embed",
        },
        {
            id: "dinner",
            title: "Dinner Banquet",
            date: weddingDate,
            startTime: "19:00",
            endTime: "22:30",
            venueName: "Dinner banquet venue to be confirmed",
            address: "Add banquet address here",
            attire: "Semi-formal",
            description:
                "An evening banquet for dinner invitees. Dinner time is tentative and will be updated closer to the date.",
            mapUrl: "https://maps.google.com/?q=Singapore",
            mapEmbedUrl: "https://maps.google.com/maps?q=Singapore&output=embed",
        },
    ] satisfies EventDetails[],
    gallery: [
        {
            src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85",
            alt: "Wedding couple walking together",
        },
        {
            src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85",
            alt: "Wedding table flowers",
        },
        {
            src: "https://images.unsplash.com/photo-1529634597503-139d3726fed5?auto=format&fit=crop&w=1200&q=85",
            alt: "Wedding rings",
        },
        {
            src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=85",
            alt: "Wedding venue detail",
        },
    ] satisfies GalleryImage[],
    highlights: [
        {
            src: "https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?auto=format&fit=crop&w=1400&q=85",
            alt: "Soft wedding bouquet",
        },
        {
            src: "https://images.unsplash.com/photo-1525258946800-98cfd641d0de?auto=format&fit=crop&w=1400&q=85",
            alt: "Warm wedding dinner setting",
        },
    ] satisfies GalleryImage[],
    qa: [
        {
            question: "Who said I love you first?",
            answer: "Placeholder answer. Add something fun and true here.",
        },
        {
            question: "What is our ideal date?",
            answer: "Good food, an unhurried walk, and time to talk.",
        },
        {
            question: "What are we most excited for?",
            answer: "Celebrating with the people who have shaped our lives.",
        },
    ],
    faq: [
        {
            question: "What should I wear?",
            answer: "Look under details for the dress code! But it's not strict - we'll be glad you came either way :)",
        },
        {
            question: "Can I change my RSVP after submitting?",
            answer: "You can only view your submitted RSVP details. Please contact us if you need to make any changes after submitting.",
        },
        {
            question: "How do I share dietary preferences?",
            answer: "The RSVP form includes dietary fields for church lunch attendees and dinner meal selections for dinner attendees.",
        },
    ],
    contact: {
        title: "Contact Us",
        body: "Questions or RSVP changes? Reach out to either one of us directly.",
        email: "tanyijia@gmail.com",
        phone: "+65 9678 4612",
    },
};
