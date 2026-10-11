import { IProduct } from "./IProduct";
import { OrderMethod } from "./IProduct";

enum currency {
    USD = "USD",
    EUR = "EUR",
    SAR = "SAR",
    AED = "AED",
}

export interface StoreSettings {
    name: string;
    slug: string;
    tagline: string;
    description: string;
    currency: currency;
    settings: {
        branding: {
            logo?: string;
            coverImage?: string;
            showTestimonials: boolean;
            showFaqs: boolean;
            showStatistics: boolean;
        };
        contactInfo: {
            whatsappNumber?: string;
            instagramProfile?: string;
            facebookProfile?: string;
            storeAddress?: string;
            phoneNumber?: string;
            email?: string;
            workingHours?: string;
        };
    };
    shippingNote: string;
    products: IProduct[];
    orderMethod: OrderMethod[];
    googleMapsLink: string;
    isActive: boolean;
};     