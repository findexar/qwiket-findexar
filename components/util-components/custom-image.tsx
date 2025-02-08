import Image from 'next/image';

const CustomImage = ({ src, alt, width, height }: { src: string, alt: string, width: number, height: number }) => {
    const customLoader = ({ src }: { src: string }) => {
        return src; // Return the src directly
    };

    return (
        <Image
            loader={customLoader}
            src={src}
            alt={alt}
            width={width}
            height={height}
            layout="responsive"
        />
    );
};

export default CustomImage;