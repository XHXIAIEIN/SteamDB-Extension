'use strict';

GetOption( {
	'hidden-achievements': true,
	'spoiler-achievements': true,
}, function( items )
{
	if( !items[ 'hidden-achievements' ] )
	{
		return;
	}

	const spoilerAchievements = !!items[ 'spoiler-achievements' ];
	const ownsGame = !!document.querySelector( '#compareAvatar a' );
	const currentUser = document.querySelector( '#global_actions .user_avatar' );
	const path = window.location.pathname.match( /^\/stats\/\w+/ );

	if( currentUser && path )
	{
		const currentUserUrl = currentUser.href.replace( /\/$/, '' );
		console.log( currentUserUrl, path );

		const tab = document.createElement( 'div' );
		tab.className = 'tab steamdb_stats_tab';

		const link = document.createElement( 'a' );
		link.className = 'tabOn';
		link.href = `${currentUserUrl}${path}?tab=achievements`;
		link.textContent = _t( 'view_your_achievements' );

		tab.appendChild( link );
		document.querySelector( '#tabs' ).appendChild( tab );

		const headers = new Headers();
		headers.append( 'Accept', 'text/html' );
		headers.append( 'X-ValveUserAgent', 'panorama' );
		headers.append( 'X-Requested-With', 'SteamDB' );

		const params = new URLSearchParams();
		params.set( 'tab', 'achievements' );
		params.set( 'panorama', 'please' );

		fetch( `${currentUserUrl}${path}?${params.toString()}`, {
			headers,
		} )
			.then( ( response ) => response.text() )
			.then( ( response ) =>
			{
				response = response.match( /g_rgAchievements\s*=\s*(\{.+?\});/ );

				if( !response )
				{
					return;
				}

				response = JSON.parse( response[ 1 ] );

				if( !response )
				{
					return;
				}

				const elements = document.querySelectorAll( '.achieveTxt > h3' );
				const achievements = Object.values( { ...response.closed, ...response.open } );

				if( achievements.length === 0 )
				{
					return;
				}

				if( !ownsGame )
				{
					const headerContentLeft = document.getElementById( 'headerContentLeft' );

					if( headerContentLeft )
					{
						headerContentLeft.appendChild( document.createTextNode( _t( 'hidden_achievement_but_loaded' ) ) );
					}
				}

				for( const achievement of achievements )
				{
					for( const element of elements )
					{
						if( element.textContent !== achievement.name )
						{
							continue;
						}

						if( !achievement.closed && achievement.progress )
						{
							const progress = document.createElement( 'span' );
							progress.className = 'achievePercent wt steamdb_achievement_progress';
							progress.textContent = _t( 'achievement_your_progress', [ achievement.progress.currentVal, achievement.progress.max_val ] );

							const meter = document.createElement( 'meter' );
							meter.min = achievement.progress.min_val;
							meter.max = achievement.progress.max_val;
							meter.value = achievement.progress.currentVal;
							progress.appendChild( meter );

							const achievePercent = element.closest( '.achieveRow' ).querySelector( '.achievePercent' );
							achievePercent.insertAdjacentElement( 'afterend', progress );
						}

						if( ownsGame )
						{
							if( achievement.closed )
							{
								continue;
							}
						}
						else
						{
							const img = document.createElement( 'img' );
							img.width = 64;
							img.height = 64;
							img.src = achievement.closed ? achievement.icon_closed : achievement.icon_open;
							const compareImg = document.createElement( 'div' );
							compareImg.className = 'compareImg compare_rightcol_element';
							compareImg.appendChild( img );

							const achieveRow = element.closest( '.achieveRow' );
							achieveRow.insertBefore( compareImg, element.parentNode.parentNode );

							if( achievement.closed )
							{
								achieveRow.classList.add( 'unlocked' );
							}
						}

						if( !achievement.hidden )
						{
							continue;
						}

						const parent = element.parentNode.querySelector( 'h5' );

						if( spoilerAchievements && !achievement.closed )
						{
							const span = document.createElement( 'span' );
							span.className = 'steamdb_achievement_spoiler';
							span.appendChild( document.createTextNode( achievement.desc ) );

							const hiddenAchiev = document.createElement( 'i' );
							hiddenAchiev.textContent = _t( 'hidden_achievement_hover' );

							parent.appendChild( hiddenAchiev );
							parent.appendChild( span );
						}
						else
						{
							const hiddenAchiev = document.createElement( 'i' );
							hiddenAchiev.textContent = _t( 'hidden_achievement' );

							parent.appendChild( hiddenAchiev );
							parent.appendChild( document.createTextNode( achievement.desc ) );
						}

						break;
					}
				}
			} );
	}
} );
