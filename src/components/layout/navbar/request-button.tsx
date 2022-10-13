import Link from 'next/link';
import { useSettings } from '@contexts/settings.context';
import { useRouter } from 'next/router';
import { useWindowSize } from '@utils/use-window-size'
export default function RequestButton({ page, displayHeaderSearch, hasRequests }) {
  const { indexPageSlug } = useSettings();
  const { query } = useRouter();
  const slug = query?.pageSlug ?? indexPageSlug;

  const size = useWindowSize();
  const isMobile = size.width < 768;

  let color = page?.navColor
  if (isMobile) {
    if (displayHeaderSearch) {
      color = 'black'
    }
  } else {
    if (displayHeaderSearch) {
      color = 'black'
    }
    if (hasRequests) {
      color = 'black'
    }
  }

  return (
    <Link href={`/pages/${slug}/request`}>
      <img className="cursor-pointer" width={32} src={color === 'white' ? "/icons/hands_w.svg" : "/icons/hands_b.svg"} />
    </Link>
  );
}
