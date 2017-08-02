<?php

namespace BonusBundle\Bonus;

use BonusBundle\Entity\Inventory;
use ChatBundle\Entity\Message;
use Doctrine\ORM\EntityManager;
use MatchBundle\Box\ReturnBox;
use MatchBundle\Entity\Game;
use MatchBundle\Entity\Player;

/**
 * Class SkipPlayerBonus
 * @package BonusBundle\Bonus
 */
class SkipPlayerBonus extends AbstractBonus
{
    /**
     * Get the unique id of the bonus
     * @return string
     */
    public function getId()
    {
        return 'skip_player';
    }

    /**
     * Get the probability to catch this bonus
     * @return integer
     */
    public function getProbabilityToCatch()
    {
        return 15;
    }

    /**
     * Get options to add in inventory
     * @return array
     */
    public function getOptions()
    {
        return [
            'select' => 'enemy',
        ];
    }

    /**
     * Only human can get it
     * @param Player $player
     *
     * @return boolean
     */
    public function canWeGetIt(Player $player)
    {
        return (!$player->isAi());
    }

    /**
     * Can the player use this bonus now ?
     * @param Game   $game
     * @param Player $player
     *
     * @return boolean
     */
    public function canUseNow(Game $game, Player $player = null)
    {
        return ($player !== null);
    }

    /**
     * before tour : remove a player
     * @param Game      $game
     * @param Player    $player
     * @param Inventory $inventory (options contain "player" to exclude)
     * @param ReturnBox $returnBox
     * @param array     $options   Contain teamList from GameRpc::nextTour()
     *
     * @return boolean|array Data to push
     */
    public function onBeforeTour(Game &$game, Player &$player, Inventory &$inventory, ReturnBox &$returnBox = null, array &$options = [])
    {
        $playerPositionExclude = $inventory->getOption('player');

        // Update teamlist
        foreach ($options as $teamId => $players) {
            foreach ($players as $iPlayer => $position) {
                if ($playerPositionExclude == $position) {
                    unset($options[$teamId][$iPlayer]);
                    if (empty($options[$teamId])) {
                        unset($options[$teamId]);
                    } else {
                        $options[$teamId] = array_values($options);
                    }

                    $this->sendMessage($game, $player, $playerPositionExclude);
                    $this->remove = true;

                    break 2;
                }
            }
        }

        return false;
    }

    /**
     * Send chat message on use
     * @param Game    $game
     * @param Player  $player
     * @param integer $victimPosition
     */
    private function sendMessage(Game $game, Player $player, $victimPosition)
    {
        $victim = $game->getPlayerByPosition($victimPosition);
        if (!$victim) {
            return;
        }

        $context = [
            'victim' => $victim->getName(),
            'user' => $player->getName(),
        ];

        $message = new Message();
        $message
            ->setGame($game)
            ->setText('bonus.skip_player.msg')
            ->setContext($context);
        $this->entityManager->persist($message);
    }
}
