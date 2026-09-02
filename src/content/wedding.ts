import type { EventDetails, GalleryImage } from "../types/wedding";
import heroImage from "../assets/hero-image.jpg";
import homeHeroImage from "../assets/home-hero.jpg";
import homeHeroMobileImage from "../assets/home-hero-mobile.jpg";
import storyImage from "../assets/story-image.jpg";

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
    ],
    gate: {
        image: heroImage,
        imageAlt: "Yi Jia and Rachel holding hands with engagement ring in front of mountain landscape",
    },
    hero: {
        headline: "Yi Jia & Rachel",
        body: "A gentle celebration of faith, family, and the people who have walked with us.",
        image: homeHeroImage,
        mobileImage: homeHeroMobileImage,
        imageAlt: "Yi Jia and Rachel embracing in front of mountain landscape",
    },
    story: {
        title: "Our Story",
        image: storyImage,
        imageAlt: "Yi Jia and Rachel smiling together in front of mountain landscape",
        paragraphs: [
            "From a green-tinted drawing of a nurse sparked a love that blossomed to what it is today.",
            "After the very first night they met, Yi Jia had already decided that Rachel was one worth pursuing, as he wrote in his journal.",
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
        ],
    },
    events: [
        {
            id: "ceremony",
            title: "Church Wedding Ceremony & Lunch Buffet",
            date: weddingDate,
            startTime: "11:00 AM",
            endTime: "2:00 PM",
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
            startTime: "7:00 PM",
            endTime: "11:00 PM",
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
        { src: "/gallery/DSC05844.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
        { src: "/gallery/DSC05854.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
        { src: "/gallery/DSC05863.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
        { src: "/gallery/DSC05897.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
        { src: "/gallery/DSC05883.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
        { src: "/gallery/DSC05974.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
        { src: "/gallery/DSC05909.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
        { src: "/gallery/DSC05910.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
        { src: "/gallery/DSC05946.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
        { src: "/gallery/DSC05998.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
        { src: "/gallery/DSC05999.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
        { src: "/gallery/DSC06006.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
        { src: "/gallery/DSC06017.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
        { src: "/gallery/DSC06025.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
        { src: "/gallery/DSC06034.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
        { src: "/gallery/DSC06037.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
        { src: "/gallery/DSC06058.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
        { src: "/gallery/DSC06060.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
        { src: "/gallery/DSC06079.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
        { src: "/gallery/DSC06090.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
        { src: "/gallery/DSC06097.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
        { src: "/gallery/DSC06101.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
        { src: "/gallery/DSC06105.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
        { src: "/gallery/DSC06137.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
        { src: "/gallery/DSC06144.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
        { src: "/gallery/DSC06224.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
        { src: "/gallery/DSC06239.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
        { src: "/gallery/DSC06296.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
        { src: "/gallery/DSC06310.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
    ] satisfies GalleryImage[],
    highlights: [
        { src: "/gallery/DSC05883.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
        { src: "/gallery/DSC05974.jpg", alt: "Yi Jia & Rachel pre-wedding photo" },
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
            answer: "You can edit your submitted RSVP with your invite password until the RSVP deadline. Please contact us if you need changes after the deadline.",
        },
        {
            question: "How do I share dietary preferences?",
            answer: "The RSVP form includes dietary fields for church lunch attendees and dinner meal selections for dinner attendees.",
        },
    ],
    contact: {
        title: "Contact Us",
        body: "Questions or RSVP changes? Reach out to either one of us directly.",
    },
};
