import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { siteContent } from "../content/wedding";
import { HomeGallerySection } from "./home/sections/HomeGallerySection";
import { GalleryModal } from "./GalleryModal";

describe("Gallery Integration", () => {
  it("contains exactly 29 unique photos in siteContent.gallery", () => {
    expect(siteContent.gallery.length).toBe(29);
    const uniqueSrcs = new Set(siteContent.gallery.map((img) => img.src));
    expect(uniqueSrcs.size).toBe(29);
    // Ensure duplicate -2 files were excluded
    siteContent.gallery.forEach((img) => {
      expect(img.src).not.toMatch(/-2\.jpg$/);
    });
  });

  it("renders the 6 curated preview photos and the 'View gallery' button in HomeGallerySection", () => {
    const handleOpenImage = vi.fn();
    render(<HomeGallerySection onOpenImage={handleOpenImage} />);

    // 4 portraits + 2 landscapes = 6 buttons
    const photoButtons = screen.getAllByRole("button", { name: /Open photo \d+/i });
    expect(photoButtons.length).toBe(6);

    const viewAllButton = screen.getByRole("button", { name: /View gallery/i });
    expect(viewAllButton).toBeDefined();

    fireEvent.click(viewAllButton);
    expect(handleOpenImage).toHaveBeenCalledWith(0);
  });

  it("renders GalleryModal with counter, image, thumbnail navigation, and handles next/prev/close", () => {
    const handleClose = vi.fn();
    const handleChange = vi.fn();

    // Mock scrollIntoView in jsdom
    Element.prototype.scrollIntoView = vi.fn();

    render(
      <GalleryModal
        images={siteContent.gallery}
        activeIndex={0}
        onClose={handleClose}
        onChange={handleChange}
      />
    );

    // Counter displays "1 / 29"
    expect(screen.getByText("1 / 29")).toBeDefined();

    // Main image rendered with first src
    const mainImg = screen.getByRole("dialog").querySelector("img[src='/gallery/DSC05844.jpg']");
    expect(mainImg).not.toBeNull();

    // Next image button advances
    const nextBtn = screen.getByRole("button", { name: "Next image" });
    fireEvent.click(nextBtn);
    expect(handleChange).toHaveBeenCalledWith(1);

    // Previous image button goes to last image (wrapping)
    const prevBtn = screen.getByRole("button", { name: "Previous image" });
    fireEvent.click(prevBtn);
    expect(handleChange).toHaveBeenCalledWith(28);

    // Thumbnail navigation buttons
    const thumb5 = screen.getByRole("button", { name: "Go to photo 5" });
    fireEvent.click(thumb5);
    expect(handleChange).toHaveBeenCalledWith(4);

    // Close button
    const closeBtn = screen.getByRole("button", { name: "Close gallery" });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
