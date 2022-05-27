export declare type Activity = {
	titlemodule: string;
	acti_title: string;
	start: string;
	end: string;
	semester: number;
	room: {
		code: string;
	};
};

export declare type Data = {
	city: CampusKey;
	course: CoursesKey;
	total: number;
};

export enum Campus {
	'FR/BDX' = 'Bordeaux',
	'FR/LIL' = 'Lille',
	'FR/LYN' = 'Lyon',
	'FR/MAR' = 'Marseille',
	'FR/MLH' = 'Mulhouse',
	// 'FR/MLN' = "Moulin",
	'FR/MPL' = 'Montpellier',
	'FR/NAN' = 'Nantes',
	'FR/NCE' = 'Nice',
	'FR/NCY' = 'Nancy',
	'FR/PAR' = 'Paris',
	'FR/REN' = 'Rennes',
	'FR/RUN' = 'La Réunion',
	'FR/STG' = 'Strasbourg',
	'FR/TLS' = 'Toulouse',
	'BJ/COT' = 'Cotonou'
}

export enum Courses {
	'bachelor/classic' = 'bachelor',
	'bachelor/tek1ed' = 'bachelor',
	'bachelor/tek2ed' = 'bachelor',
	'bachelor/tek3s' = 'bachelor',
	'digital' = 'digital',
	'premsc' = 'premsc'
}

export declare type CampusKey = keyof typeof Campus;
export declare type CoursesKey = keyof typeof Courses;
