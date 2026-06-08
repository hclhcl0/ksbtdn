import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { HeroCarouselClient } from './HeroCarouselClient';
import styles from './HeroCarousel.module.css';

async function getBanners() {
  try {
    const payload = await getPayload({ config: configPromise });
    const { docs } = await payload.find({
      collection: 'banners',
      where: {
        and: [
          { isActive: { equals: true } },
          { position: { equals: 'home_slider' } },
        ]
      },
      sort: 'order',
      depth: 1,
    });
    return docs;
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
}

async function getSliderSettings() {
  try {
    const payload = await getPayload({ config: configPromise });
    const settings = await payload.findGlobal({ slug: 'banner-settings' });
    return {
      size: settings?.heroSliderSize || 'medium',
      customHeight: settings?.heroSliderCustomHeight || 500,
      effect: (settings as any)?.heroSliderEffect || 'slide',
      autoplayDelay: (settings as any)?.heroSliderAutoplayDelay || 5000,
    };
  } catch(e) {
    return { size: 'medium', customHeight: 500, effect: 'slide', autoplayDelay: 5000 };
  }
}

export const HeroCarousel = async () => {
  const banners = await getBanners();
  const settings = await getSliderSettings();

  if (!banners || banners.length === 0) {
    return (
      <section className={styles.heroSection}>
        <div className="container">
          <div className={styles.banner}>
            <a href="#">
               <img src="https://hcdc.vn/public/img/files/260407.jpg?v=1780728683" alt="Default Banner" />
            </a>
          </div>
        </div>
      </section>
    );
  }

  return <HeroCarouselClient banners={banners} globalSize={settings.size} globalCustomHeight={settings.customHeight} globalEffect={settings.effect} globalAutoplayDelay={settings.autoplayDelay} />;
};
