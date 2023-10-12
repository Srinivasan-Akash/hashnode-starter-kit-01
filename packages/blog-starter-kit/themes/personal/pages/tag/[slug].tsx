import addPublicationJsonLd from '@starter-kit/utils/seo/addPublicationJsonLd';
import { getAutogeneratedPublicationOG } from '@starter-kit/utils/social/og';
import request from 'graphql-request';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Container from '../../components/container';
import { AppProvider } from '../../components/contexts/appContext';
import Footer from '../../components/footer';
import Layout from '../../components/layout';
import MinimalPosts from '../../components/minimal-posts';
import PersonalHeader from '../../components/personal-theme-header';
import {
	PostFragment,
	PublicationFragment,
	TagPostsByPublicationDocument,
	TagPostsByPublicationQuery,
	TagPostsByPublicationQueryVariables,
} from '../../generated/graphql';

type Props = {
	posts: PostFragment[];
	publication: PublicationFragment;
	tag: string;
};

export default function Tag({ publication, posts, tag }: Props) {
	const title = `#${tag} - ${publication.title}`;

	return (
		<AppProvider publication={publication}>
			<Layout>
				<Head>
					<title>{title}</title>
					<meta
						property="og:image"
						content={publication.ogMetaData.image || getAutogeneratedPublicationOG(publication)}
					/>
					<meta
						property="twitter:image"
						content={publication.ogMetaData.image || getAutogeneratedPublicationOG(publication)}
					/>
					<script
						type="application/ld+json"
						dangerouslySetInnerHTML={{ __html: JSON.stringify(addPublicationJsonLd(publication)) }}
					/>
				</Head>
				<Container className="mx-auto flex max-w-2xl flex-col items-stretch gap-10 px-5 py-10">
					<PersonalHeader />
					<div className="flex flex-col gap-1 pt-5">
						<p className="font-bold uppercase text-slate-500 dark:text-neutral-400">Tag</p>
						<h1 className="text-4xl font-bold text-slate-900 dark:text-neutral-50">#{tag}</h1>
					</div>
					{posts.length > 0 && <MinimalPosts context="home" posts={posts} />}
					<Footer />
				</Container>
			</Layout>
		</AppProvider>
	);
}

type Params = {
	slug: string;
};

export const getStaticProps: GetStaticProps<Props, Params> = async ({ params }) => {
	if (!params) {
		throw new Error('No params');
	}
	const data = await request<TagPostsByPublicationQuery, TagPostsByPublicationQueryVariables>(
		process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT,
		TagPostsByPublicationDocument,
		{
			host: process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST,
			first: 20,
			tagSlug: params.slug,
		},
	);

	const publication = data.publication;
	if (!publication) {
		return {
			notFound: true,
		};
	}
	const posts = publication.posts.edges.map((edge) => edge.node);

	return {
		props: {
			posts,
			publication,
			tag: params.slug,
		},
		revalidate: 1,
	};
};

export async function getStaticPaths() {
	return {
		paths: [],
		fallback: 'blocking',
	};
}
