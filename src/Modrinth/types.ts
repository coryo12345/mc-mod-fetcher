export interface ModrinthVersion {
  /** The ID of the version, encoded as a base62 string */
  id: string;
  /** The ID of the project this version is for */
  project_id: string;
  /** The ID of the author who published this version */
  author_id: string;
  /** Whether the version is featured or not */
  featured: boolean;
  /** The name of this version */
  name: string;
  /** The version number. Ideally follows semantic versioning */
  version_number: string;
  /** The changelog for this version */
  changelog: string | null;
  /** Legacy field, always null */
  changelog_url: string | null;
  /** The date the version was published (ISO-8601) */
  date_published: string;
  /** The number of times this version has been downloaded */
  downloads: number;
  /** The release channel for this version */
  version_type: 'release' | 'beta' | 'alpha';
  /** The status of the version */
  status: 'listed' | 'archived' | 'draft' | 'unlisted' | 'scheduled' | 'unknown';
  /** The requested status for the version */
  requested_status: 'listed' | 'archived' | 'draft' | 'unlisted' | null;
  /** A list of versions of Minecraft that this version supports */
  game_versions: string[];
  /** The mod loaders that this version supports (or "minecraft" for resource packs) */
  loaders: string[];
  /** A list of files available for download for this version */
  files: ModrinthVersionFile[];
  /** A list of specific versions of projects that this version depends on */
  dependencies: ModrinthDependency[];
}

export interface ModrinthVersionFile {
  /** A map of hashes of the file. The key is the hashing algorithm (sha1, sha512) */
  hashes: {
    sha1: string;
    sha512: string;
    [key: string]: string;
  };
  /** A direct link to the file */
  url: string;
  /** The name of the file */
  filename: string;
  /** Whether this file is the primary one for its version */
  primary: boolean;
  /** The size of the file in bytes */
  size: number;
  /** The type of the file */
  file_type:
    | 'required-resource-pack'
    | 'optional-resource-pack'
    | 'sources-jar'
    | 'dev-jar'
    | 'javadoc-jar'
    | 'unknown'
    | 'signature'
    | null;
}

export interface ModrinthDependency {
  /** The ID of the version that this version depends on */
  version_id: string | null;
  /** The ID of the project that this version depends on */
  project_id: string | null;
  /** The file name of the dependency (mostly for external dependencies) */
  file_name: string | null;
  /** The type of dependency */
  dependency_type: 'required' | 'optional' | 'incompatible' | 'embedded';
}
