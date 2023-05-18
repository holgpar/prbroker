'use strict';

export type Repository = {
  host: string;
  owner: string;
  name: string;
};

export type Coordinates = {
  repository: Repository;
  number: number;
};

export type TrackingInfo = Coordinates & {
  seen_at: Date;
  index: number;
};

export interface User {
  login: string;
}

export interface APIData {
  html_url: string;
  updated_at: string;
  title: string;
  user: User | null;
}

export type Data = TrackingInfo & {
  apiData: APIData;
};
