import { component$ } from '@builder.io/qwik';
import type { Tile } from '../../contract';
import HomepageTile from "./homepagetile";
import MachHTitle from '../shared/machhtitle';

export interface Props {
    tiles: Tile[];
}


const HomepageTiles = component$<Props>(({ tiles }) => {

    const focusedTiles = tiles.filter(t => t.isFocused);
    const pastProjectTiles = tiles.filter(t => !t.isFocused);

    return (
        <section class="homepagetiles flex flex-col items-center">
            {focusedTiles.length > 0 && (
                <>
                    <div class="relative w-full my-6">
                        <MachHTitle>
                            Onze focus
                        </MachHTitle>
                    </div>
                    <div class="flex flex-wrap w-full md:w-[calc(100%-4rem)]">
                        {
                            focusedTiles.filter(t => t.isFocused).map((tile: Tile, i: number) => {
                                return (
                                    <HomepageTile key={`proj${i}`} tile={tile} />
                                )
                            })
                        }
                    </div>
                </>
            )}
            {pastProjectTiles.length > 0 && (
                <>
                    <div class="relative w-full my-6">
                        <MachHTitle>
                            Onze gerealiseerde projecten
                        </MachHTitle>
                    </div>
                    <div class="flex flex-wrap md:w-[calc(100%-4rem)]">
                        {
                            pastProjectTiles.map((tile: Tile, i: number) => {
                                return (
                                    <HomepageTile key={`proj${i}`} tile={tile} />
                                )
                            })
                        }
                    </div>
                </>
            )}
        </section>
    );
});

export default HomepageTiles;