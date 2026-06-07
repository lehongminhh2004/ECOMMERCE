'use client';

import {ProductCard} from "@/components/commerce/product-card";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,} from "@/components/ui/carousel";
import {FragmentOf, readFragment} from "@/graphql";
import {ProductCardFragment} from "@/lib/vendure/fragments";
import type {ProductCardPrice} from "@/lib/vendure/product-card-price-overrides";
import {useId} from "react";

interface ProductCarouselClientProps {
    title: string;
    products: Array<FragmentOf<typeof ProductCardFragment>>;
    priceOverrides?: Record<string, ProductCardPrice>;
}

export function ProductCarousel({title, products, priceOverrides}: ProductCarouselClientProps) {
    const id = useId();

    return (
        <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold mb-8">{title}</h2>
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {products.map((product, i) => (
                            <CarouselProductItem
                                key={id + i}
                                product={product}
                                priceOverrides={priceOverrides}
                            />
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden md:flex"/>
                    <CarouselNext className="hidden md:flex"/>
                </Carousel>
            </div>
        </section>
    );
}

function CarouselProductItem({
    product: productProp,
    priceOverrides,
}: {
    product: FragmentOf<typeof ProductCardFragment>;
    priceOverrides?: Record<string, ProductCardPrice>;
}) {
    const product = readFragment(ProductCardFragment, productProp);

    return (
        <CarouselItem className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
            <ProductCard product={productProp} priceOverride={priceOverrides?.[product.productId]}/>
        </CarouselItem>
    );
}
